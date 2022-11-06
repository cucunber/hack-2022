import { TnvedId } from "../../domain";
import TnvedDomain from "../../domain/tnved";
import { getQueryParams } from "../../utils";
import API from "../api";

const endpoints = {
	analyticsOneTwoSix: '/customs/analytic/one_two_six/',
	analyticsThree: '/customs/analytic/three/',
	analyticsFour: '/customs/analytic/four/',
	analyticsFive: '/customs/analytic/five/',
	analyticsSeven: '/customs/analytic/seven/',
}

type AnalyticsEndpointsResponse = {
	analyticsOneTwoSix: { one: string, two: string, six: string },
	analyticsThree: { value: number },
	analyticsFour: { value: number },
	analyticsFive: { value: string },
	analyticsSeven: { value: string[] },
}

class AnalyticsService {
	private apiInstance: API
	constructor(apiInstance: API){
		this.apiInstance = apiInstance;
	}
	async getAnalyticPart<T extends keyof typeof endpoints>(endpoint: T, params: object) {
		try {
			const queryParams = getQueryParams(params);
			const { data } = await this.apiInstance.get<AnalyticsEndpointsResponse[T]>(endpoints[endpoint], { params: queryParams });
			return data
		} catch(e){
			throw e
		}
	}
	async getAllData(params: object){
		const oneTwoSixPromise = await this.getAnalyticPart('analyticsOneTwoSix', params);
		const threePromise = await this.getAnalyticPart('analyticsThree', params);
		const fourPromise = await this.getAnalyticPart('analyticsFour', params);
		const fivePromise = await this.getAnalyticPart('analyticsFive', params);
		const sevenPromise = await this.getAnalyticPart('analyticsSeven', params);
		try {
			const analytics = await Promise.all([oneTwoSixPromise, threePromise, fourPromise, fivePromise, sevenPromise]);
			return analytics;
		} catch (e){
			throw e
		}
	}
	async getTnvedData(id: TnvedId) {
		try {
			const { data } = await this.apiInstance.get<TnvedDomain>(`/customs/tnved/${id}/`);
			return data;
		} catch(e) {
			throw e
		}
	}
}

export default AnalyticsService;