import { makeAutoObservable, runInAction } from "mobx";
import TnvedDomain, { TnvedId } from "../domain/tnved";
import AnalyticsService from "../services/analytics";
import API from "../services/api";
import { dataFormatters, getQueryParams } from "../utils";

type GetExport = {
	startDate: string,
	endDate: string,
	code: string,
	region: string,
}

class AnalyticsStore {
	flags = {
		isLoading: true,
	}
	data = {
		one: '',
		two: '',
		three: 0,
		four: 0,
		five: '',
		six: '',
		seven: [] as string[],
	}
	tnved: TnvedDomain | null = null;
	analyticService: AnalyticsService;
	constructor(private apiInstance: API){
		makeAutoObservable(this);
		this.analyticService = new AnalyticsService(apiInstance);
	}

	async getExcelExport(params: GetExport){
		try {
			const queryParams = getQueryParams(params);
			const { data } = await this.apiInstance.get('customs/analytic/export_to_xlsx', { params: queryParams, responseType: 'blob' });
			return window.URL.createObjectURL(data);
		} catch(e){
			console.error(e);
		}
	}

	async getPPTXExport(params: GetExport){
		try {
			const queryParams = getQueryParams(params);
			const { data } = await this.apiInstance.get('customs/analytic/export_to_pptx', { params: queryParams, responseType: 'blob' });
			return URL.createObjectURL(data);
		} catch(e){
			console.error(e);
		}
	}

	async getAnalytics(id: TnvedId, params: GetExport) {
		runInAction(() => {
			this.flags.isLoading = true;
		})
		try{
			const tnvedData = await this.analyticService.getTnvedData(id);
			const analytics = await this.analyticService.getAllData(params);
			runInAction(() => {
				const [p1, p2,p3,p4,p5] = analytics;
				this.data.one = p1.one;
				this.data.two = p1.two;
				this.data.three = p2.value;
				this.data.four = p3.value;
				this.data.five = p4.value;
				this.data.six = p1.six;
				this.data.seven = p5.value;
				this.tnved = new TnvedDomain(dataFormatters.camelize(tnvedData));
				this.flags.isLoading = false;
			});
		}catch(e){
			console.error(e);
		}
	}
}

export default AnalyticsStore;