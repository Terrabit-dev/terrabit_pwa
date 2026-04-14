import type { OpcionSelect } from "./types";

export const RAZAS_BOVINAS: OpcionSelect[] = [
    { codigo: "1111", nombre: "Holstein (Frisona)" },
    { codigo: "1116", nombre: "Angus" },
    { codigo: "1114", nombre: "Hereford" },
    { codigo: "9907", nombre: "Simmental" },
    { codigo: "1113", nombre: "Charolais (Xarolesa)" },
    { codigo: "1115", nombre: "Jersey" },
    { codigo: "1117", nombre: "Limousin (Limusina)" },
    { codigo: "0000", nombre: "Mestizo" },
];

export const SEXOS: OpcionSelect[] = [
    { codigo: "01", nombre: "Hembra" },
    { codigo: "02", nombre: "Macho" },
];

export const SEXOS_CA: OpcionSelect[] = [
    { codigo: "01", nombre: "Femella" },
    { codigo: "02", nombre: "Mascle" },
];

export const APTITUDES: OpcionSelect[] = [
    { codigo: "1", nombre: "Carne" },
    { codigo: "2", nombre: "Leche" },
    { codigo: "3", nombre: "Doble propósito" },
];

export const APTITUDES_CA: OpcionSelect[] = [
    { codigo: "1", nombre: "Carn" },
    { codigo: "2", nombre: "Llet" },
    { codigo: "3", nombre: "Doble propòsit" },
];