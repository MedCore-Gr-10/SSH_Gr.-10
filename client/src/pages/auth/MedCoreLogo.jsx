import medCoreLogoImg from "../../assets/MedCoreLogo.png";

export default function MedCoreLogo() {
  return (
    <div className="mc-logo-row">
      <img
        className="mc-logo-img"
        src={medCoreLogoImg}
        alt="MedCore"
        decoding="async"
      />
    </div>
  );
}
