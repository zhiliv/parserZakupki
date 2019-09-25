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
	async = require('async');

//создание экземаляра парсера с таймаутом 10000мс
var nick = new Nick({ timeout: 15000 });
/**
 * получение кода страницы по ссылке
 * @function getData
 * @param {String} url Ссылка для получения данных со страницы
 * @return { Object} data - данные; err: ошибка
 * @memberof funcParse
 */
var getDataBody = async (tab, ind) => {
	//отспрочка выполнения
	let defer = q.defer();
	//объект для храения результата
	let result = { data: null, err: null };
	//поытка открытия страницы
	if (ind == 1) {
		await tab.waitUntilPresent('[ng-if="withState"]', 15000);
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

/**
 * Создание новой вкладки
 * @function newTap
 * @async
 * @return {Object} вкладка
 * @memberof funcParse
 */
var newTap = async () => {
	//создание вкладки
	const tab = await nick.newTab();
	return tab;
};

/**
 * Открытие страницы на вкладке
 * @function openTab
 * @param {Object} tab Вкладка
 * @param {String} url Ссылка
 * @return {Object} Открытая страница во вкладке
 * @memberof funcParse
 */
var openTab = async (tab, url) => {
	//отспрочка выполнения
	let defer = q.defer();
	//объект для храения результата
	let result = { data: null, err: null };
	//поытка открытия страницы
	try {
		await tab.open(url);
		result.data = tab;
	} catch (err) {
		result.err = err;
	}
	defer.resolve(result);
	return defer.promise;
};

/**
 * Получение количества найдейнных позиций
 * @function getLengthListPage
 * @param {String} html Содердимое страницы
 * @return {Number} Количество дайденных элементов
 * @memberof funcParse
 */
var getLengthListPage = html => {
	//перевод кода в jquery
	let body = $.parseHTML(html);
	//получение содержимого BODY
	let text = $(body)
		.find('[ng-if="withState"]')
		.text();
	//удаление надписи
	let lengthPages = text.replace('Найдено: ', '');
	//возврат значения в числовом типе
	return Number(lengthPages);
};

/**
 * Получение списка продуктов со станицы
 * @function getListProduct
 * @param {String} html Код страницы
 * @
  */
var getListProduct = html => {
	let defer = q.defer();
	let body = $.parseHTML(html);
	let list = $(body).find('#listView div [class="col-12 description"]');
	async.eachOfSeries(list, async (row, ind) => {
		let obj = {};
		obj.name = $(row)
			.find('.o_name')
			.text();
    //console.log("TCL: obj.name", obj.name)
		let href = $(row)
			.find('.o_name')
			.attr('href');
    obj.id = get_id(href);
    let param = ''
    let listParam = $(row).find('[ng-repeat="characteristic in dataItem.skuCharacteristics"]');
    await getListParam(listParam)
    let i = $(document).find('span.k-state-selected').text()
	});
	return list.length;
};

var getListParam = async list => {
  let defer = q.defer();
  let result = ''
  if(list.length)
  await async.eachOfSeries(list, async(row, ind) => {
    let text = $(row).text()
    let element = text.split(':');
    if(ind == 0){
      result = `{"${format_element(element[0])}": "${format_element(element[1])}",`
    }
    else{
      if(ind != list.length-1){
        result += `"${format_element(element[0])}": "${format_element(element[1])}",`
      }
      else{
        result += `"${format_element(element[0])}": "${format_element(element[1])}"}`
      }
    }
    if(ind == list.length-1){
      result = JSON.parse(result)
      //console.log("TCL: result", result)
      defer.resolve(result)
    }
  })
  return defer
}

var format_element = element => {
  element = element.trim()
  element = element.replace('\\', '/');
  element = element.replace(`"`, `'`)
  return element
}

/**
 * Получение id проудкта
 * @function get_id
 * @param {String} ссылка
 * @return {String} id
 * @memberof funcParse
 */
var get_id = href => {
	//удаление символов
	href = href.replace('https://', '');
	//разбиение ссылки на массив
	let list = href.split('/');
	//получениуе полденего элемента массмива
	let id = list[list.length - 1];
	return id;
};

var nextPage = async tab => {
  try {
    await tab.waitUntilPresent('span .k-state-selected', 15000)
    await tab.click(selector)
  } catch (err) {
    console.log("An error occured:", err)
  }
}

module.exports.getDataBody = getDataBody;

module.exports.getLengthListPage = getLengthListPage;

module.exports.newTab = newTap;

module.exports.openTab = openTab;

module.exports.getListProduct = getListProduct;
