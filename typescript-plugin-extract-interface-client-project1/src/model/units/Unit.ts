import { Thing } from "../newName";

export interface Unit extends Thing {
  health: number
}

// &%&% moveDeclarationNamed('Unit', '../base/impl/ThingImpl.ts')