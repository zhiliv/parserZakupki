'use strict';

let countOnPage = 50;
/**
 * Модуль для  выполнения парсинга
 * @member parser
 */

//подулючение модля с ффункциями для парсинга
const fn = require('./funcParse');

let ind = 1;
let maxInd = 1;
/**
 * Функция запуска парсинга
 * @memberof parser
 * @async
 */
module.exports.start = async () => {
	//стартовая ссылка
	let url = `https://old.zakupki.mos.ru/#/sku?s.costPerUnitLessEqual=5000&s.productionDirectoryPaths.0=.1.72095941.&s.state=actual&s.entityStateIn.0=1&v.ps=${countOnPage}&v.s=relevance&v.sd`;

	//переменная для зранения html
	let html;
	await fn.getDataBody(url, 1).then(res => {
		html = res.data;
	});
	//fn.getLengthListPage(html);
	console.log('TCL: module.exports.start -> fn.getLengthListPage(html)', fn.getLengthListPage(html));
};

module.exports.maxInd = maxInd;