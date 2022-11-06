import clsx from "clsx";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LikeIcon } from "../../assets";
import { Copy, Input, Loader } from "../../components";
import Dropdown, { DropdownOption } from "../../components/Dropdown";
import { routes } from "../../config";
import filters from "../../config/filters";
import { FiltersProvider, useFilters } from "../../context";
import { TnvedCode, TnvedId } from "../../domain";
import useStore from "../../store";
import {
  ClearImport,
  Partners,
  Sanctions,
  Tab,
  Tabs,
  Volume,
} from "./components";
import s from "./styles.module.css";

type AnalyticsProps = {
  code: TnvedCode;
  id: TnvedId;
};

const Analytics: FC<AnalyticsProps> = observer(({ code, id }) => {
  const {
    region,
    setRegion,
    country,
    setCountry,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useFilters();
  const filterValues = useMemo(
    () => ({ region, country, startDate, endDate }),
    [country, endDate, region, startDate]
  );
  const federalDistricts = useStore("federalDistrictsStore");
  const analyticStore = useStore("analyticsStore");
  const {
    data: { one, two, three, four, five, six, seven },
    tnved,
  } = analyticStore;

  const userStore = useStore("userStore");

  const isLikedFormStore = useMemo(
    () => userStore.favorite.findIndex(({ tnvedId }) => tnvedId === id) !== -1,
    [id, userStore.favorite]
  );
  const [isLiked, setIsLiked] = useState(isLikedFormStore);

  useEffect(() => {
    if (id) analyticStore.getAnalytics(+id, { ...filterValues, code });
  }, [analyticStore, code, filterValues, id]);

  useEffect(() => {
    if (isLiked) {
      userStore.addToFavorite(id);
      return;
    }
    userStore.removeFromFavorite(id);
  }, [id, isLiked, userStore]);

  const handleLike = useCallback(async () => {
    setIsLiked((prev) => !prev);
  }, []);

  const regionOptions: DropdownOption[] = useMemo(
    () =>
      federalDistricts.regions.map(({ name }) => ({
        value: name,
        label: name,
      })),
    [federalDistricts.regions]
  );
  const tabs = useMemo<Tab[]>(
    () => [
      {
        id: "volumes",
        label: "Объемы",
        content: (
          <Volume
            filters={filterValues}
            code={code}
            country={country}
            setCountry={setCountry}
            countries={federalDistricts.countries}
          />
        ),
      },
      {
        id: "partners",
        label: "Партнеры",
        content: <Partners filters={filterValues} code={code} />,
      },
      {
        id: "sanctions",
        label: "Санкции",
        content: <Sanctions filters={filterValues} code={code} />,
      },
      {
        id: "clearImport",
        label: "Чистый импорт",
        content: <ClearImport filters={filterValues} code={code} />,
      },
    ],
    [code, country, federalDistricts.countries, filterValues, setCountry]
  );

  const handleDownload = useCallback(
    (type: "pptx" | "xlsx") => async () => {
      try {
        let url: string | undefined = "";
        if (type === "pptx") {
          url = await analyticStore.getPPTXExport({
            ...filterValues,
            code,
          });
        } else {
          url = await analyticStore.getExcelExport({
            ...filterValues,
            code,
          });
        }
        if (url) {
          const templateLink = document.createElement("a");
          templateLink.style.display = "none";
          templateLink.href = url;
          templateLink.setAttribute("download", code + "." + type);
          if (typeof templateLink.download === "undefined") {
            templateLink.setAttribute("target", "_blank");
          }
          document.body.appendChild(templateLink);
          templateLink.click();
          document.body.removeChild(templateLink);
          window.URL.revokeObjectURL(url);
          return;
        }
        throw new Error("empty link");
      } catch (e) {
        toast.error("Ошибка загрузки");
      }
    },
    [analyticStore, code, filterValues]
  );

  if (analyticStore.flags.isLoading) {
    return (
      <div className={"full-loader"}>
        <Loader />
      </div>
    );
  }

  return (
    <section className={clsx(s.wrapper, "container")}>
      <div className={s.info}>
        <div className={clsx("block", s.name, s.block)}>{tnved?.tnvedName}</div>
        <Copy value={code} withIcon={false}>
          <div className={clsx("block", s.code, s.block)}>{code}</div>
        </Copy>
        <div
          onClick={handleLike}
          className={clsx("block", s.like, s.block, { [s.liked]: isLiked })}
        >
          <LikeIcon />
        </div>
      </div>
      <div className={s.content}>
        <div className={s.analytics}>
          <h2 className={s.analyticTitle}>Общая статистика</h2>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Объем импорта за период:{" "}
              <span className="highlight">{one} тыс.долл</span>
            </p>
            <p>
              Объем экспорт за период:{" "}
              <span className="highlight">{two} тыс.долл</span>
            </p>
          </div>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Чистый {three < 0 ? "импорт" : "экспорт"} за период:{" "}
              <span className="highlight">{Math.abs(three)}</span>
            </p>
            <p>
              Изменение чистого импорта (год к году):{" "}
              <span className="highlight">{four}%</span>
            </p>
          </div>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Основные партнеры по импорту:{" "}
              <span className="highlight">{five}</span>
            </p>
          </div>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Таможенные пошлины на импорт:{" "}
              <span className="highlight">{six}</span>
            </p>
          </div>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Наличие на ограничение на импорт:{" "}
              <span className="highlight">
                {seven.length === 0 ? "Санкций нет" : seven.join(",")}
              </span>
            </p>
          </div>
          <h2 className={s.analyticTitle}>Ключевые значения</h2>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Потенциальный объем ниши:{" "}
              <span className="highlight">
                {three < 0 ? `${Math.abs(three)}` : 0}
              </span>
            </p>
          </div>
          <div className={clsx("block", s.analyticsBlock)}>
            <p>
              Рост ниши за год: <span className="highlight">{four}%</span>
            </p>
          </div>
          <div className={s.exportSection}>
            <button
              className={clsx("button-blue", s.exportButton)}
              onClick={handleDownload('xlsx')}
            >
              Excel
            </button>
            <button
              className={clsx("button-blue", s.exportButton)}
              onClick={handleDownload('pptx')}
            >
              PPTX
            </button>
          </div>
        </div>
        <div className={clsx(s.statistics, "block")}>
          <div className={s.filter}>
            <h3 className={s.filterTitle}>Регион</h3>
            <Dropdown
              value={region}
              dropClassName={s.drop}
              setValue={setRegion}
              options={regionOptions}
            />
          </div>
          <div className={s.filter}>
            <h3 className={s.filterTitle}>Период</h3>
            <div className={s.dateInputs}>
              <Input
                value={startDate}
                setValue={setStartDate}
                type="date"
                min={filters.date.min}
                max={filters.date.max}
              />
              <Input
                value={endDate}
                setValue={setEndDate}
                type="date"
                min={filters.date.min}
                max={filters.date.max}
              />
            </div>
          </div>
          <Tabs tabs={tabs} />
        </div>
      </div>
    </section>
  );
});

const AnalyticsWrapper = observer(() => {
  const { code, id } = useParams();
  const navigator = useNavigate();

  useEffect(() => {
    if (!code || !id) {
      toast.error(`Товара с кодом ${code} не существует`);
      navigator(routes[404]);
    }
  }, [code, id, navigator]);

  if (!code || !id) {
    return null;
  }

  return (
    <FiltersProvider>
      <Analytics code={code} id={+id} />
    </FiltersProvider>
  );
});

export default AnalyticsWrapper;
