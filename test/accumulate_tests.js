'use strict';


const TestRegExp = /test\/(.*\/)*test_.*\.js$/i;


LoadTestsRecursively(__dirname + '/../dist');


////////////////////////////////////////////////
function LoadTestsRecursively(path) {
    const fs = require('fs');

    let items;
    try {
        items = fs.readdirSync(path, {withFileTypes: true});
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`path not exist: ${path.replace(__dirname + '/', '')}`);
            return;
        }
        else
            throw err;
    }
    
    for (let item of items) {
        if (item.isDirectory()) {
            LoadTestsRecursively(path + '/' + item.name);
            continue;
        }
        else if (item.isFile()) {
            const fullPath = path + '/' + item.name;

            if (!TestRegExp.test(fullPath.replace('\\', '/')))
                continue;
            require(fullPath);
        }
    }
}
