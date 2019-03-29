execute TypeScript directly in the browser, like  ts-node but in the browser too.

# TODO: 

 * webworker

 * libraries load from url o embed in bundle file: The target is the browser and the objective is not performance but that works everywhere. This project when bundled contains a lot of big files that will get embedded (see src/packed). It would good if there is some configuration to allow user to choose which of those to bundle. Now we are packaging all. 

 * is ts-morph really necessary ? perhaps is faster just ts