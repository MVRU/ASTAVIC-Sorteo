// src/components/Footer.js
const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer app-footer--brand" role="contentinfo">
      <div className="container app-footer__content">
        <div className="app-footer__meta">
          <div className="app-footer__copyright">
            &copy; {year} ASTAVIC · Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
