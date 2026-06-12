import logo1 from "../../assets/images/logo2.png";

function Footer() {
  return (
    <footer className="bg-teal-700 text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo1} alt="Logo ITPCARGO" className="w-12 h-12 object-contain rounded-lg" />
            <div>
              <div className="font-semibold text-sm">ITPCARGO</div>
              <div className="text-teal-300 text-xs mt-0.5">Logística y despacho</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-semibold text-teal-200 mb-3 text-xs uppercase tracking-wider">Servicio</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-teal-100 hover:text-white transition-colors text-xs">Recomendaciones de embalaje</a></li>
                <li><a href="#" className="text-teal-100 hover:text-white transition-colors text-xs">Cobertura</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-teal-200 mb-3 text-xs uppercase tracking-wider">Síguenos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-teal-100 hover:text-white transition-colors text-xs">Instagram</a></li>
                <li><a href="#" className="text-teal-100 hover:text-white transition-colors text-xs">Facebook</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-teal-200 mb-3 text-xs uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-teal-100 hover:text-white transition-colors text-xs">Privacidad</a></li>
                <li><a href="#" className="text-teal-100 hover:text-white transition-colors text-xs">Términos</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-teal-600 mt-6 pt-4 text-xs text-teal-400 text-center">
          © 2025 ITPCARGO™. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
