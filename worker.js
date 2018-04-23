function factorial(num) {
	if(num === 1 || num === 0) return 1;
	else return num * factorial(num-1);
};

function randomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

var x = randomIntFromInterval(1, 10);

console.log(process.pid + " is up, randomInt is " + x);

var sendResult = function(message){
	setTimeout(() => {
		process.send({
			type:'factorial_result',
			from: 'Worker ' + process.pid,
			data: {
				number: message.data.number,
				result: message.data.number
				// result: factorial(message.data.number)
			}
		});	
	},  x * 1000);
	
} 

process.on('message', function(message) {
	console.log( `%d: message come in, task is %d`, this.pid, message.data.number);
	if(message.type === 'factorial') {
		sendResult(message);
	}
});
