import logoInsignare from "../../assets/images/logo-insignare.png";


function LoadingScreen({ closing, onFinish }) {

  return (
    <div
      className={`loading-screen ${closing ? "loading-screen--hide" : ""}`}
      onTransitionEnd={() => {
        if (closing) {
          onFinish();
        }
      }}
    >

      <div className="loading-screen__content">

        <img
          className="loading-screen__logo-image"
          src={logoInsignare}
          alt="Instituto Politécnico Insignare"
        />

        <h1 className="loading-screen__title">
          Instituto Politécnico Insignare
        </h1>


        <div className="loading-screen__bar">
          <span></span>
        </div>


        <p className="loading-screen__text">
          Cargando...
        </p>

      </div>

    </div>
  );
}


export default LoadingScreen;