var path = require("path"),
    colors = require("colors");

var cluster = require('cluster'),
    os = require('os'),
    cores = os.cpus();
var threadNum = cores.length;

var MyCluster = function(list, script) {
    if(list && list.length > 0){
        this.taskList = list;    
    } else {
        console.log("不能为空啊");
        return;
    }

    this.script = script;
}

MyCluster.prototype.start = function(){
    var _this = this;
    
    cluster.setupMaster({
        exec : path.join(__dirname, _this.script),
        args : ["--environment", "dev"]
    });

    if (cluster.isMaster) {
        for (var i = threadNum - 1; i >= 0; i--) {
            this.spawnNewWorker().send({
                type: 'factorial',
                from: 'master',
                data: {
                    number: _this.taskList.pop()
                }
            });
        };

        cluster.on("fork", function(worker) {
            console.log("Worker : [ %d ][ Status : Forking ]".cyan, worker.process.pid);
        });

        cluster.on("online", function(worker) {
            console.log("Worker : [ %d ][ Status : Online ]".green, worker.process.pid);
        });

        cluster.on("listening", function(worker, address) {
            console.log("Worker : [ %d ][ Status : Listening ][ Address : %s ][ Port : %d ]".yellow, worker.process.pid, address.address, address.port);
        });

        cluster.on("disconnect", function(worker) {
            console.log("Worker : [ %d ][ Status : Disconnected ]".white, worker.process.pid);
        });


        /*
         * Restart Dead Workers
        */

        cluster.on("exit", function(worker, code, signal) {
            console.log("Worker : [ %d ][ Status : Exit ][ Signal : %s ][ Code : %s ]".red, worker.process.pid, signal, code);
            if(_this.taskList.length == 0){
                process.exit(0);
            } else{
                _this.spawnNewWorker().send({
                    type: 'factorial',
                    from: 'master',
                    data: {
                        number: _this.taskList.pop()
                    }
                });
            }
        });
    }
}

MyCluster.prototype.spawnNewWorker = function(){
    var _this = this;
    var worker = cluster.fork();
    worker.on('message', function(message) {
        //TODO handle result
        console.log(message.from + ': ' + message.type + ' ' + message.data.number + ' = ' + message.data.result);

        if(_this.taskList.length > 0){
            worker.send({
                type: 'factorial',
                from: 'master',
                data: {
                    number: _this.taskList.pop()
                }
            });        
        } else{
            threadNum--;
            console.log("[%d] job done, remmaining [%d]".red, worker.process.pid, threadNum);
            if(threadNum == 0){
                console.log("task list is empty".yellow);
                worker.kill(0);
            }
        }
    });
    return worker;
}

MyCluster.prototype.getTask = function(){
    return this.taskList;
}

MyCluster.prototype.getScript = function(){
    return this.Script;
}

module.exports = MyCluster;