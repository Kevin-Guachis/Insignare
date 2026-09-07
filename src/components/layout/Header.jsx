import { Link } from "react-router-dom";
import logo from "../../assets/images/logo-insignare.png";
import Navbar from "./Navbar";

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-brand" to="/" aria-label="Instituto Politécnico Insignare — Inicio">
          <img className="site-brand__logo" src={logo} alt="" width="1460" height="1600" />
          <span className="site-brand__name">INSTITUTO<br />POLITÉCNICO<br />INSIGNARE</span>
        </Link>
        <Navbar />
      </div>
    </header>
  );
}

export default Header;
