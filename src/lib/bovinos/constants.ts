export interface OpcionSelect {
    codigo: string;
    nombre: string;
}

// ── Sexo — mapaSexos ─────────────────────────────────────────────────────────
export const SEXOS: OpcionSelect[] = [
    { codigo: "02", nombre: "Macho" },
    { codigo: "01", nombre: "Hembra" },
];

export const SEXOS_CA: OpcionSelect[] = [
    { codigo: "02", nombre: "Mascle" },
    { codigo: "01", nombre: "Femella" },
];

// ── Aptitud — mapaAptitudes ──────────────────────────────────────────────────
export const APTITUDES: OpcionSelect[] = [
    { codigo: "02", nombre: "Carne" },
    { codigo: "01", nombre: "Leche" },
    { codigo: "03", nombre: "Doble propósito" },
];

export const APTITUDES_CA: OpcionSelect[] = [
    { codigo: "02", nombre: "Carn" },
    { codigo: "01", nombre: "Llet" },
    { codigo: "03", nombre: "Doble propòsit" },
];

// ── Muerte/Aborto — mapaMuertes ──────────────────────────────────────────────
export const TIPOS_MUERTE: OpcionSelect[] = [
    { codigo: "01", nombre: "Muerte" },
    { codigo: "02", nombre: "Aborto" },
];

export const TIPOS_MUERTE_CA: OpcionSelect[] = [
    { codigo: "01", nombre: "Mort" },
    { codigo: "02", nombre: "Avortament" },
];

// ── Transporte — mapaTransporte ──────────────────────────────────────────────
export const MEDIOS_TRANSPORTE: OpcionSelect[] = [
    { codigo: "04", nombre: "Camión" },
    { codigo: "05", nombre: "Barco" },
    { codigo: "06", nombre: "Avión" },
    { codigo: "07", nombre: "Tren" },
    { codigo: "08", nombre: "Conducción a pie" },
    { codigo: "99", nombre: "Otros" },
];

export const MEDIOS_TRANSPORTE_CA: OpcionSelect[] = [
    { codigo: "04", nombre: "Camió" },
    { codigo: "05", nombre: "Vaixell" },
    { codigo: "06", nombre: "Avió" },
    { codigo: "07", nombre: "Tren" },
    { codigo: "08", nombre: "Conducció a peu" },
    { codigo: "99", nombre: "Altres" },
];

// ── Estado llegada — mapaEstadosLlegada ──────────────────────────────────────
export const ESTADOS_LLEGADA: OpcionSelect[] = [
    { codigo: "92", nombre: "Llegado" },
    { codigo: "93", nombre: "Fallecido durante el transporte" },
    { codigo: "94", nombre: "Fallecido en el establo" },
    { codigo: "80", nombre: "Sacrificado" },
];

export const ESTADOS_LLEGADA_CA: OpcionSelect[] = [
    { codigo: "92", nombre: "Arribat" },
    { codigo: "93", nombre: "Mort durant el transport" },
    { codigo: "94", nombre: "Mort a les quadres" },
    { codigo: "80", nombre: "Sacrificat" },
];

// ── Sí/No — mapaOpcionesSiNo ─────────────────────────────────────────────────
export const OPCIONES_SI_NO: OpcionSelect[] = [
    { codigo: "SI", nombre: "SI" },
    { codigo: "NO", nombre: "NO" },
];

// ── Tipo presentación — mapaTiposPresentacion ────────────────────────────────
export const TIPOS_PRESENTACION: OpcionSelect[] = [
    { codigo: "1", nombre: "Tipo I" },
    { codigo: "2", nombre: "Tipo IIA" },
    { codigo: "3", nombre: "Tipo IIB" },
    { codigo: "4", nombre: "Tipo IIIA" },
    { codigo: "5", nombre: "Tipo IIIB" },
];

// ── Tipo envío — mapaTiposEnvios ─────────────────────────────────────────────
export const TIPOS_ENVIO = [
    { codigo: "01", nombre: "Correu ordinari", nombreEs: "Correo ordinario" },
    { codigo: "04", nombre: "Correu certificat", nombreEs: "Correo certificado" }
];

// ── Dirección envío — mapaTiposDireccionEnvio ────────────────────────────────
export const TIPOS_DIRECCION = [
    { codigo: "01", nombre: "Oficina Comarcal", nombreEs: "Oficina Comarcal" },
    { codigo: "02", nombre: "Titular / Ramader", nombreEs: "Titular / Ganadero" },
    { codigo: "03", nombre: "Adreça alternativa", nombreEs: "Dirección alternativa" }
];


// ── Material duplicados — mapaTiposMaterialDuplicados ────────────────────────
export const TIPOS_MATERIAL_DUPLICADO: OpcionSelect[] = [
    { codigo: "07", nombre: "Crotal" },
    { codigo: "20", nombre: "Crotal electrónico" },
    { codigo: "21", nombre: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bolo ruminal" },
];

// ── Material — mapaTiposMaterial ─────────────────────────────────────────────
export const TIPOS_MATERIAL = [
    { codigo: "21", nombre: "Injectable electrònic", nombreEs: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bol ruminal", nombreEs: "Bolo ruminal" },
    { codigo: "23", nombre: "Cròtal simple tissular", nombreEs: "Crotal simple tisular" },
    { codigo: "24", nombre: "Cròtal doble tissular", nombreEs: "Crotal doble tisular" },
    { codigo: "26", nombre: "Cròtal + Bol ruminal", nombreEs: "Crotal + Bolo ruminal" },
    { codigo: "27", nombre: "Cròtal + Cròtal electrònic", nombreEs: "Crotal + Crotal electrónico" },
    { codigo: "25", nombre: "Reidentificació", nombreEs: "Reidentificación" }
];

// ── Oficinas comarcales — mapaOficinasComarcales ─────────────────────────────
export const OFICINAS_COMARCALES = [
    { codigo: "OC001", nombre: "Alt Camp" }, { codigo: "OC002", nombre: "Alt Empordà" },
    { codigo: "OC003", nombre: "Alt Penedès" }, { codigo: "OC004", nombre: "Alt Urgell" },
    { codigo: "OC005", nombre: "Alta Ribagorça" }, { codigo: "OC006", nombre: "Anoia" },
    { codigo: "OC007", nombre: "Bages" }, { codigo: "OC008", nombre: "Baix Camp" },
    { codigo: "OC009", nombre: "Baix Ebre" }, { codigo: "OC010", nombre: "Baix Empordà" },
    { codigo: "OC011", nombre: "Baix Llobregat" }, { codigo: "OC012", nombre: "Baix Penedès" },
    { codigo: "OC013", nombre: "Barcelonès" }, { codigo: "OC014", nombre: "Berguedà" },
    { codigo: "OC015", nombre: "Cerdanya" }, { codigo: "OC016", nombre: "Conca de Barberà" },
    { codigo: "OC017", nombre: "Garraf" }, { codigo: "OC018", nombre: "Garrigues" },
    { codigo: "OC019", nombre: "Garrotxa" }, { codigo: "OC020", nombre: "Gironès" },
    { codigo: "OC021", nombre: "Maresme" }, { codigo: "OC022", nombre: "Montsià" },
    { codigo: "OC023", nombre: "Noguera" }, { codigo: "OC024", nombre: "Osona" },
    { codigo: "OC025", nombre: "Pallars Jussà" }, { codigo: "OC026", nombre: "Pallars Sobirà" },
    { codigo: "OC027", nombre: "Pla d'Urgell" }, { codigo: "OC028", nombre: "Pla de l'Estany" },
    { codigo: "OC029", nombre: "Priorat" }, { codigo: "OC030", nombre: "Ribera d'Ebre" },
    { codigo: "OC031", nombre: "Ripollès" }, { codigo: "OC032", nombre: "Segarra" },
    { codigo: "OC033", nombre: "Segrià" }, { codigo: "OC034", nombre: "La Selva" },
    { codigo: "OC035", nombre: "Solsonès" }, { codigo: "OC036", nombre: "Tarragonès" },
    { codigo: "OC037", nombre: "Terra Alta" }, { codigo: "OC038", nombre: "Urgell" },
    { codigo: "OC039", nombre: "Vall d'Aran" }, { codigo: "OC040", nombre: "Vallès Occidental" },
    { codigo: "OC041", nombre: "Vallès Oriental" }, { codigo: "OC042", nombre: "Moianès" },
];

// ── Empresas suministradoras — mapaEmpresaSubministradora ────────────────────
export const EMPRESAS_SUBMINISTRADORAS = [
    { codigo: "B02164317", nombre: "DATAMARS IBERICA SLU" },
    { codigo: "A78100609", nombre: "AZASA" }
];

// ── Razas — mapaRazas (completo del PDF annex) ───────────────────────────────
export const RAZAS_BOVINAS: OpcionSelect[] = [
    { codigo: "9999", nombre: "Otras" },
    { codigo: "0000", nombre: "Conjunto Mestizo" },
    { codigo: "0099", nombre: "Desconocida" },
    { codigo: "0201", nombre: "Abondance" },
    { codigo: "1101", nombre: "Albera" },
    { codigo: "1164", nombre: "Alentejana" },
    { codigo: "1102", nombre: "Alistana-Sanabresa" },
    { codigo: "0801", nombre: "Angler" },
    { codigo: "1116", nombre: "Angus" },
    { codigo: "1166", nombre: "Arouquesa" },
    { codigo: "0202", nombre: "Armoricaine" },
    { codigo: "1103", nombre: "Asturiana de la Montaña" },
    { codigo: "1125", nombre: "Asturiana de los Valles" },
    { codigo: "1151", nombre: "Ayrshire" },
    { codigo: "0203", nombre: "Aurochs Reconstitue" },
    { codigo: "1121", nombre: "Avileña-Negra Ibérica" },
    { codigo: "0802", nombre: "Aubrac" },
    { codigo: "1160", nombre: "Baltata Romanesca" },
    { codigo: "0204", nombre: "Bazadaise" },
    { codigo: "0205", nombre: "Bearnaise" },
    { codigo: "1104", nombre: "Betizu" },
    { codigo: "1137", nombre: "Berrenda Colorada" },
    { codigo: "1132", nombre: "Berrenda Negra" },
    { codigo: "9901", nombre: "Bisonte" },
    { codigo: "1141", nombre: "Blanca Belga" },
    { codigo: "1124", nombre: "Blanca Cacereña" },
    { codigo: "0206", nombre: "Blue du Nord" },
    { codigo: "0207", nombre: "Bordelaise" },
    { codigo: "9902", nombre: "Brahman" },
    { codigo: "0208", nombre: "Brettonne Pie Noire" },
    { codigo: "1105", nombre: "Bruna de los Pirineos" },
    { codigo: "1152", nombre: "Búfalo" },
    { codigo: "1131", nombre: "Cárdena Andaluza" },
    { codigo: "1144", nombre: "Cachena" },
    { codigo: "1145", nombre: "Caldelana" },
    { codigo: "1134", nombre: "Canaria" },
    { codigo: "0225", nombre: "Camargue" },
    { codigo: "0209", nombre: "Casta (Aure y St. Girons)" },
    { codigo: "9903", nombre: "Cebú" },
    { codigo: "1153", nombre: "Chianina" },
    { codigo: "1113", nombre: "Charolesa" },
    { codigo: "0210", nombre: "Coopelso" },
    { codigo: "0211", nombre: "Corse" },
    { codigo: "0212", nombre: "Creole" },
    { codigo: "0803", nombre: "Dexter" },
    { codigo: "0213", nombre: "Ferrandaise" },
    { codigo: "1130", nombre: "Fleckvieh" },
    { codigo: "0214", nombre: "Froment du Leon" },
    { codigo: "1111", nombre: "Frisona" },
    { codigo: "1146", nombre: "Frieiresa" },
    { codigo: "0804", nombre: "Galloway" },
    { codigo: "1156", nombre: "Gasconne" },
    { codigo: "0215", nombre: "Gelbvieh" },
    { codigo: "1154", nombre: "Guernsey" },
    { codigo: "0805", nombre: "Highland" },
    { codigo: "0216", nombre: "Herens" },
    { codigo: "1114", nombre: "Hereford" },
    { codigo: "0217", nombre: "Inra" },
    { codigo: "0806", nombre: "Irish Maol / Droimeann" },
    { codigo: "1115", nombre: "Jersey" },
    { codigo: "0807", nombre: "Kerry" },
    { codigo: "0233", nombre: "Kobe" },
    { codigo: "1140", nombre: "Lidia" },
    { codigo: "1147", nombre: "Limiana" },
    { codigo: "1117", nombre: "Limusina" },
    { codigo: "0218", nombre: "Lourdaise" },
    { codigo: "1107", nombre: "Mallorquina" },
    { codigo: "0220", nombre: "Marchigiana" },
    { codigo: "0219", nombre: "Maraichine" },
    { codigo: "1109", nombre: "Marismeña" },
    { codigo: "0808", nombre: "Maine Anjou-Rouge des Prés" },
    { codigo: "1136", nombre: "Menorquina" },
    { codigo: "1159", nombre: "Mertolenga" },
    { codigo: "0221", nombre: "Mirandaise" },
    { codigo: "1108", nombre: "Monchina" },
    { codigo: "1155", nombre: "Montbeliard" },
    { codigo: "1123", nombre: "Morucha" },
    { codigo: "1162", nombre: "Pasiega" },
    { codigo: "1126", nombre: "MRY" },
    { codigo: "1157", nombre: "Murciana-Levantina" },
    { codigo: "0809", nombre: "Murray Grey" },
    { codigo: "0222", nombre: "N. Dama" },
    { codigo: "1138", nombre: "Negra Andaluza" },
    { codigo: "0223", nombre: "Nantaise" },
    { codigo: "1127", nombre: "Normanda" },
    { codigo: "1167", nombre: "Norueguesa" },
    { codigo: "1139", nombre: "Pajuna" },
    { codigo: "1168", nombre: "Pallaresa" },
    { codigo: "1158", nombre: "Parda de Montaña" },
    { codigo: "1112", nombre: "Parda" },
    { codigo: "0810", nombre: "Partenaise" },
    { codigo: "0224", nombre: "Pie Rouge des Plaines" },
    { codigo: "1143", nombre: "Piamontesa" },
    { codigo: "1129", nombre: "Pirenaica" },
    { codigo: "1135", nombre: "Palmera" },
    { codigo: "9908", nombre: "Pinzgauer" },
    { codigo: "1169", nombre: "Preta" },
    { codigo: "1171", nombre: "Ramo Grande" },
    { codigo: "1120", nombre: "Retinta" },
    { codigo: "1122", nombre: "Rubia Gallega" },
    { codigo: "1142", nombre: "Rubia de Aquitania" },
    { codigo: "0226", nombre: "Rouge Flamande" },
    { codigo: "0811", nombre: "Romagnola" },
    { codigo: "0812", nombre: "Rotbunte" },
    { codigo: "1161", nombre: "Roja Letona" },
    { codigo: "1118", nombre: "Roja Danesa" },
    { codigo: "0813", nombre: "Salers" },
    { codigo: "1149", nombre: "Sayaguesa" },
    { codigo: "0227", nombre: "Saosnoise" },
    { codigo: "1163", nombre: "Serrana de Teruel" },
    { codigo: "1110", nombre: "Serrana Negra" },
    { codigo: "9906", nombre: "Shorthorn" },
    { codigo: "9907", nombre: "Simmental" },
    { codigo: "0814", nombre: "South Devon" },
    { codigo: "1165", nombre: "Swedish Red and White" },
    { codigo: "1119", nombre: "St. Gertrudis" },
    { codigo: "0228", nombre: "Tarentaise" },
    { codigo: "1150", nombre: "Terreña" },
    { codigo: "1128", nombre: "Tudanca" },
    { codigo: "1170", nombre: "Valdostana" },
    { codigo: "1148", nombre: "Vianesa" },
    { codigo: "0229", nombre: "Villard de Lans" },
    { codigo: "0230", nombre: "Vosgienne" },
    { codigo: "0231", nombre: "Wagyu" },
    { codigo: "0232", nombre: "Watusi" },
];

// ── Helper: buscar nombre por código (equivalente a getRazaBovinasId) ─────────
export function getNombreRaza(codigo: string): string {
    return RAZAS_BOVINAS.find(r => r.codigo === codigo)?.nombre ?? "Desconocida";
}

export function getNombreSexo(codigo: string, lang: "es" | "ca" = "es"): string {
    const lista = lang === "ca" ? SEXOS_CA : SEXOS;
    return lista.find(s => s.codigo === codigo)?.nombre ?? codigo;
}

export function getNombreAptitud(codigo: string, lang: "es" | "ca" = "es"): string {
    const lista = lang === "ca" ? APTITUDES_CA : APTITUDES;
    return lista.find(a => a.codigo === codigo)?.nombre ?? codigo;
}

export function getNombreTransporte(codigo: string | null | undefined, lang: "es" | "ca" = "es"): string {
    if (!codigo) return lang === "ca" ? "Altres" : "Otros";
    const lista = lang === "ca" ? MEDIOS_TRANSPORTE_CA : MEDIOS_TRANSPORTE;
    return lista.find(t => t.codigo === codigo)?.nombre ?? codigo;
}

// ── Países — espejo de mapaPaises del Android (strings.xml) ──────────────────
const PAISES: Record<string, string> = {
    "000": "Desconocido", "101": "Alemania", "102": "Francia", "103": "Italia",
    "104": "Holanda", "105": "Bélgica", "106": "Luxemburgo", "107": "Reino Unido",
    "108": "Irlanda", "109": "Dinamarca", "110": "Grecia", "111": "España",
    "112": "Portugal", "113": "Austria", "114": "Finlandia", "115": "Suecia",
    "201": "Afganistán", "202": "Albania", "203": "Andorra", "204": "Angola",
    "205": "Antillas Holandesas", "206": "Arabia Saudita", "207": "Argelia",
    "208": "Argentina", "209": "Armenia", "210": "Aruba", "211": "Isla de la Ascensión",
    "212": "Australia", "213": "Azerbaiyán", "214": "Bahamas", "215": "Baréin",
    "216": "Bangladés", "217": "Barbados", "218": "Belice", "219": "Benín",
    "220": "Islas Bermudas", "221": "Bután", "222": "Bielorrusia", "223": "Bolivia",
    "224": "Bosnia y Herzegovina", "225": "Botsuana", "226": "Brasil", "227": "Brunéi",
    "228": "Bulgaria", "229": "Burkina Faso", "230": "Burundi", "231": "Cabo Verde",
    "232": "Islas Caimán", "233": "Camboya", "234": "Camerún", "235": "Canadá",
    "236": "República Centroafricana", "237": "Chad", "238": "República Checa",
    "239": "Chile", "240": "China", "241": "Chipre", "242": "Colombia",
    "243": "Comoras", "244": "Congo", "245": "Islas Cook", "246": "Corea del Norte",
    "247": "Corea del Sur", "248": "Costa de Marfil", "249": "Costa Rica",
    "251": "Cuba", "252": "Diego García", "253": "Dominica", "254": "República Dominicana",
    "255": "Ecuador", "256": "Egipto", "257": "El Salvador", "258": "Emiratos Árabes Unidos",
    "259": "Eritrea", "260": "Eslovaquia", "261": "Eslovenia", "262": "Estados Unidos",
    "263": "Estonia", "264": "Etiopía", "265": "Islas Feroe", "266": "Fiyi",
    "267": "Filipinas", "268": "Gabón", "269": "Gambia", "270": "Georgia",
    "271": "Ghana", "272": "Granada", "273": "Groenlandia", "274": "Guadalupe",
    "275": "Guam", "276": "Guatemala", "277": "Guayana Francesa", "278": "Guinea-Bisáu",
    "279": "Guinea Ecuatorial", "280": "Guinea", "281": "Guyana", "282": "Haití",
    "283": "Honduras", "284": "Hong Kong", "285": "Hungría", "286": "India",
    "287": "Indonesia", "288": "Irán", "289": "Irak", "290": "Islandia",
    "291": "Israel", "292": "Jamaica", "293": "Japón", "294": "Jordania",
    "295": "Kazajistán", "296": "Kenia", "297": "Kirguistán", "298": "Kiribati",
    "299": "Kuwait", "300": "Laos", "301": "Lesoto", "302": "Letonia",
    "303": "Líbano", "304": "Liberia", "305": "Libia", "306": "Liechtenstein",
    "307": "Lituania", "308": "Macao", "309": "Macedonia", "310": "Madagascar",
    "311": "Malasia", "312": "Malaui", "313": "Maldivas", "314": "Mali",
    "315": "Malta", "316": "Islas Malvinas", "317": "Islas Marianas del Norte",
    "318": "Marruecos", "319": "Islas Marshall", "320": "Martinica", "321": "Mauricio",
    "322": "Mauritania", "323": "Mayotte", "324": "México", "325": "Micronesia",
    "326": "Midway", "327": "Moldavia", "328": "Mónaco", "329": "Mongolia",
    "330": "Montserrat", "331": "Mozambique", "332": "Myanmar", "333": "Namibia",
    "334": "Nauru", "335": "Nepal", "336": "Nicaragua", "337": "Níger",
    "338": "Nigeria", "339": "Niue", "340": "Noruega", "341": "Nueva Caledonia",
    "342": "Nueva Zelanda", "343": "Omán", "344": "Pakistán", "345": "Palaos",
    "346": "Panamá", "347": "Papúa Nueva Guinea", "348": "Paraguay", "349": "Perú",
    "350": "Polinesia Francesa", "351": "Polonia", "352": "Puerto Rico", "353": "Catar",
    "354": "Reunión", "355": "Ruanda", "356": "Rumania", "357": "Rusia",
    "358": "Sahara Occidental", "359": "Islas Salomón", "360": "Samoa Americana",
    "361": "Samoa", "362": "San Cristóbal y Nieves", "363": "San Marino",
    "364": "San Pedro y Miquelón", "365": "San Vicente y las Granadinas",
    "366": "Santa Elena", "367": "Santa Lucía", "368": "Santo Tomé y Príncipe",
    "369": "Senegal", "370": "Seychelles", "371": "Sierra Leona", "372": "Singapur",
    "373": "Siria", "374": "Somalia", "375": "Sri Lanka", "376": "Sudáfrica",
    "377": "Sudán", "378": "Suiza", "379": "Surinam", "380": "Suazilandia",
    "381": "Tayikistán", "382": "Tailandia", "383": "Taiwán", "384": "Tanzania",
    "385": "Territorios Ext. Australia", "386": "Togo", "387": "Tokelau",
    "388": "Tonga", "389": "Trinidad y Tobago", "390": "Túnez", "391": "Turkmenistán",
    "392": "Islas Turcas y Caicos", "393": "Turquía", "394": "Tuvalu",
    "395": "Ucrania", "396": "Uganda", "397": "Uruguay", "398": "Uzbekistán",
    "399": "Vanuatu", "400": "Vaticano", "401": "Venezuela", "402": "Vietnam",
    "403": "Islas Vírgenes de EE. UU.", "404": "Islas Vírgenes Británicas",
    "405": "Wallis y Futuna", "406": "Yemen", "407": "Yibuti", "408": "Serbia",
    "409": "República Democrática del Congo", "410": "Zambia", "411": "Zimbabue",
    "413": "Croacia", "414": "Estado de Palestina", "415": "Montenegro", "999": "Otros",
};

export function getNombrePais(codigo: string | undefined): string {
    if (!codigo) return "-";
    return PAISES[codigo] ?? codigo;
}

// ─── VALIDACIÓN COMPARTIDA DE DIRECCIONES ────────────────────────────────────

// Interfaz base para asegurar que cualquier formulario que envíe material tenga estos campos
export interface DireccionEnvioBase {
    adrecaLliurament: string;
    oc: string;
    ocNombre: string;
    adreca: string;
    poblacio: string;
    cp: string;
    municipi: string;
    telefonContacte: string;
}

// Función compartida: la llamaremos desde Materiales y desde Duplicados
export function validarDireccionEnvio(form: DireccionEnvioBase): { tipo: "validacion", codigo: number } | null {
    if (!form.adrecaLliurament) return { tipo: "validacion", codigo: 5 };

    if (form.adrecaLliurament === "01") {
        if (!form.oc) return { tipo: "validacion", codigo: 7 };
    } else if (form.adrecaLliurament === "02" || form.adrecaLliurament === "03") {
        if (!form.adreca.trim() || !form.poblacio.trim() || !form.cp.trim() || !form.municipi.trim() || !form.telefonContacte.trim()) {
            return { tipo: "validacion", codigo: 8 };
        }
    }
    return null;
}