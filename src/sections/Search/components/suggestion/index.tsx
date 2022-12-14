import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../../config";
import TnvedDomain from "../../../../domain/tnved";
import s from './styles.module.css';

export type SuggestionElementProps = TnvedDomain & {
	onClick?: () => void;
};

const SuggestionElement: FC<SuggestionElementProps> = ({ tnvedCode, tnvedId, tnvedName, onClick }) => {
  const navigator = useNavigate();

  const navigateToAnalytic = useCallback(() => {
	onClick?.();
    navigator(routes.analytic.replace(":code", tnvedCode.toString()).replace(':id', tnvedId.toString()));
  }, [navigator, onClick, tnvedCode, tnvedId]);

  return (
    <div className={s.wrapper} tabIndex={0} onClick={navigateToAnalytic}>
      <div className={s.code}>{tnvedCode}</div>
      <div className={s.name}>{tnvedName}</div>
    </div>
  );
};

export default SuggestionElement;
