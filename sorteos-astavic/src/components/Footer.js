const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer role="contentinfo">
      <div className="container footer__content">
        <div>
          <strong className="brand__name">Sorteos de ASTAVIC</strong>
          <p className="subtitle-small">Demostración del sistema.</p>
        </div>
        <div>&copy; {year} ASTAVIC &middot; Todos los derechos reservados.</div>
      </div>
    </footer>
  );
};

export default Footer;
