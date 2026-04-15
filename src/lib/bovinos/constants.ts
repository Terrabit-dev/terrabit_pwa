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
export const TIPOS_ENVIO: OpcionSelect[] = [
    { codigo: "01", nombre: "Correo ordinario" },
    { codigo: "04", nombre: "Correo certificado" },
];

// ── Dirección envío — mapaTiposDireccionEnvio ────────────────────────────────
export const TIPOS_DIRECCION_ENVIO: OpcionSelect[] = [
    { codigo: "01", nombre: "OC" },
    { codigo: "02", nombre: "Ganadero / Explotación ganadera" },
    { codigo: "03", nombre: "Dirección alternativa" },
];

// ── Material duplicados — mapaTiposMaterialDuplicados ────────────────────────
export const TIPOS_MATERIAL_DUPLICADO: OpcionSelect[] = [
    { codigo: "07", nombre: "Crotal" },
    { codigo: "20", nombre: "Crotal electrónico" },
    { codigo: "21", nombre: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bolo ruminal" },
];

// ── Material — mapaTiposMaterial ─────────────────────────────────────────────
export const TIPOS_MATERIAL: OpcionSelect[] = [
    { codigo: "21", nombre: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bolo ruminal" },
    { codigo: "23", nombre: "Crotal tisular simple" },
    { codigo: "24", nombre: "Crotal tisular doble" },
    { codigo: "26", nombre: "Crotal + Bol ruminal" },
    { codigo: "27", nombre: "Crotal + Crotal electrónico" },
    { codigo: "25", nombre: "Reidentificación" },
];

// ── Oficinas comarcales — mapaOficinasComarcales ─────────────────────────────
export const OFICINAS_COMARCALES: OpcionSelect[] = [
    { codigo: "OC001", nombre: "Alt Camp" },
    { codigo: "OC002", nombre: "Alt Empordà" },
    { codigo: "OC003", nombre: "Alt Penedès" },
    { codigo: "OC004", nombre: "Alt Urgell" },
    { codigo: "OC005", nombre: "Alta Ribagorça" },
    { codigo: "OC006", nombre: "Anoia" },
    { codigo: "OC007", nombre: "Bages" },
    { codigo: "OC008", nombre: "Baix Camp" },
    { codigo: "OC009", nombre: "Baix Ebre" },
    { codigo: "OC010", nombre: "Baix Empordà" },
    { codigo: "OC011", nombre: "Baix Llobregat" },
    { codigo: "OC012", nombre: "Baix Penedès" },
    { codigo: "OC013", nombre: "Barcelonès" },
    { codigo: "OC014", nombre: "Berguedà" },
    { codigo: "OC015", nombre: "Cerdanya" },
    { codigo: "OC016", nombre: "Conca de Barberà" },
    { codigo: "OC017", nombre: "Garraf" },
    { codigo: "OC018", nombre: "Garrigues" },
    { codigo: "OC019", nombre: "Garrotxa" },
    { codigo: "OC020", nombre: "Gironès" },
    { codigo: "OC021", nombre: "Maresme" },
    { codigo: "OC022", nombre: "Montsià" },
    { codigo: "OC023", nombre: "Noguera" },
    { codigo: "OC024", nombre: "Osona" },
    { codigo: "OC025", nombre: "Pallars Jussà" },
    { codigo: "OC026", nombre: "Pallars Sobirà" },
    { codigo: "OC027", nombre: "Pla d'Urgell" },
    { codigo: "OC028", nombre: "Pla de l'Estany" },
    { codigo: "OC029", nombre: "Priorat" },
    { codigo: "OC030", nombre: "Ribera d'Ebre" },
    { codigo: "OC031", nombre: "Ripollès" },
    { codigo: "OC032", nombre: "Segarra" },
    { codigo: "OC033", nombre: "Segrià" },
    { codigo: "OC034", nombre: "La Selva" },
    { codigo: "OC035", nombre: "Solsonès" },
    { codigo: "OC036", nombre: "Tarragonès" },
    { codigo: "OC037", nombre: "Terra Alta" },
    { codigo: "OC038", nombre: "Urgell" },
    { codigo: "OC039", nombre: "Vall d'Aran" },
    { codigo: "OC040", nombre: "Vallès Occidental" },
    { codigo: "OC041", nombre: "Vallès Oriental" },
    { codigo: "OC042", nombre: "Moianès" },
];

// ── Empresas suministradoras — mapaEmpresaSubministradora ────────────────────
export const EMPRESAS_SUBMINISTRADORAS: OpcionSelect[] = [
    { codigo: "B02164317", nombre: "DATAMARS IBERICA SLU" },
    { codigo: "A78100609", nombre: "AZASA" },
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