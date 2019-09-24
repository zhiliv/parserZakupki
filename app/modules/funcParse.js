'use strict';

/**
 * Модуль для с описанием ффункций для получения данных
 * @member funcParse
 */

//подключение пакетов
const Nick = require('nickjs'), //парсер
	q = require('q'), //пакет для работы с promises
	jsdom = require('jsdom'),
	dom = new jsdom.JSDOM(),
	window = dom.window,
	document = window.document,
  $ = require('jquery')(window),
  parser = require('./parser');

//создание экземаляра парсера с таймаутом 10000мс
var nick = new Nick({ timeout: 15000 });
/**
 * получение кода страницы по ссылке
 * @function getData
 * @param {String} url Ссылка для получения данных со страницы
 * @return { Object} data - данные; err: ошибка
 * @memberof funcParse
 */
var getDataBody = async (url, ind) => {
	//отспрочка выполнения
	let defer = q.defer();
	//объект для храения результата
	let result = { data: null, err: null };
	const tab = await nick.newTab();
	//поытка открытия страницы
	try {
		await tab.open(url);
		result.data = tab;
	} catch (err) {
		result.err = err;
	}
  if(ind == 1){
    await tab.waitUntilPresent('[ng-if="withState"]', 15000)
  }
	//параметры парсинга(получение содердимого Body)
	const scraper = (arg, done) => {
		//получение содерердимого тега BODy
		done(null, $('body').html());
	};
	if (!result.err) {
		//попытка содержимое страницы
		try {
			const html = await tab.evaluate(scraper);
			result.data = html;
		} catch (err) {
			result.err = err;
		}
	}
	defer.resolve(result);
	return defer.promise;
};

var getLengthListPage = html => {
	// let defer = defer()
	let body = $.parseHTML(html);
	let text = $(body).find('[ng-if="withState"]').text();
  text = text.replace('Найдено: ', '');
};

var getListProduct = async html => {
	let body = $.parseHTML(html);
	//console.log('TCL: body', body);
};



module.exports.getDataBody = getDataBody;

module.exports.getLengthListPage = getLengthListPage;
