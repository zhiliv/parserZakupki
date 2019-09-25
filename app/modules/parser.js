'use strict';

let countOnPage = 50;
/**
 * Модуль для  выполнения парсинга
 * @member parser
 */

//подулючение модля с ффункциями для парсинга
const fn = require('./funcParse');

let ind = 1;
let lengthPages = 1;
/**
 * Функция запуска парсинга
 * @memberof parser
 * @async
 */
module.exports.start = async () => {
  let e;
	let arrErr = [];
	//стартовая ссылка
	let url = `https://old.zakupki.mos.ru/#/sku?s.costPerUnitLessEqual=5000&s.productionDirectoryPaths.0=.1.72095941.&s.state=actual&s.entityStateIn.0=1&v.ps=${countOnPage}&v.s=relevance&v.sd`;

	//переменная для хранения вкладки
	var tab;
	//создание новой вкладки
	await fn.newTab().then(res => {
		tab = res;
	});
	//открытие страницы во вкладке
	await fn.openTab(tab, url).then(res => {
		res.err ? (err = res.err) : (tab = res.data);
	});

	//цикл для обхода всех страниц
	while (true) {
		//переменная для зранения текста ошибки
		let err = null;

		let html;
		if (!err) {
			//получение BODY у страницы
			await fn.getDataBody(tab, ind).then(res => {
				//проверка на наличие ошибок
				res.err ? (err = res.err) : (html = res.data);
			});
		}
		if (!err) {
			if (ind == 1) {
				//получение найденных значений
				lengthPages = await fn.getLengthListPage(html);
				lengthPages = Math.ceil(lengthPages / countOnPage);
      }
      try {
        await tab.waitUntilPresent(`a.k-link:contains(${ind+1})`, 15000)
        await tab.click(`a.k-link:contains("${ind+1}")`)
      } catch (err) {
        console.log("An error occured:", err)
      }
      fn.getListProduct(html)
      ind++
      if(ind == lengthPages){
        break
      }
      tab
			//fn.getListProduct(html)
			console.log('TCL: module.exports.start -> fn.getListProduct(html)', fn.getListProduct(html));
		}
	}
};
