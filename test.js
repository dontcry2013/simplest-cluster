var path = require('path');

var MyCluster = require(path.join(__dirname, "mycluster"))

var taskList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

var instance = new MyCluster(taskList, path.join(__dirname, "worker.js"))

console.log(instance.getTask());

instance.start();