import { Thing } from "../base/Thing";

export interface Unit extends Thing {
  health: number
}

// &%&% moveDeclarationNamed('Unit', '../base/impl/ThingImpl.ts')