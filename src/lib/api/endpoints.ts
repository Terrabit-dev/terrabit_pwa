// Tipos de las respuestas de la GTR API.
//
// NOTA: este archivo contenía además funciones `apiGet*`/`apiPut*` y los
// helpers `gtrGet`/`gtrPut`. Estaban SIN USAR (código muerto) y se eliminaron.
// El acceso real a la GTR se hace ahora por el cliente único `@/lib/api/gtrClient`
// (gtrQuery / gtrMutation), que nunca pone credenciales en la URL.


export interface GtrError {
  codi: string;
  descripcio: string;
}

export interface GtrBaseResponse {
  errors?: GtrError[];
  codi?: string;
  descripcio?: string;
}

export interface Identificador {
  identificador: string;
  identificadorElectronic: string;
}

export interface IdentificadoresResponse extends GtrBaseResponse {
  identificadors?: Identificador[];
}

export interface Animal {
  identificador: string;
  identificadorElectronic?: string;
  identificadorMare?: string;
  sexe: string;
  raca: string;
  dataNaixement?: string;
  explotacioNaixement?: string;
  paisNaixement?: string;
}

export interface ListaBovinosResponse extends GtrBaseResponse {
  animals?: Animal[];
}

// Helper de éxito sobre una respuesta GTR.
export function isGtrSuccess(response: GtrBaseResponse): boolean {
  if (response.errors && response.errors.length > 0) return false;
  const desc = response.descripcio?.toLowerCase() ?? "";
  return response.codi === "0" || desc === "ok" || desc === "correcte" || !response.codi;
}