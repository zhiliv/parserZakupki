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
  $ = require('jquery')(window),
  async = require('async'),
    parser = require('./parser')

//создание экземаляра парсера с таймаутом 10000мс
var nick = new Nick({
  timeout: 20000
});
/**
 * получение кода страницы по ссылке
 * @async
 * @function getData
 * @param {String} url Ссылка для получения данных со страницы
 * @return { Object} data - данные; err: ошибка
 * @memberof funcParse
 */
var getDataBody = async (tab, ind) => {
  //отспрочка выполнения
  let defer = q.defer();
  //объект для храения результата
  let result = {
    data: null,
    err: null
  };
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
 * @async
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
  let result = {
    data: null,
    err: null
  };
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
var getListProduct = async  html => {
  //получение тела HTML
  let body = $.parseHTML(html);
  //получение спика
  let list = $(body).find('#listView div [class="col-12 description"]');
  //обход в цикле всего списка
  await async.eachOfSeries(list, async (row, ind) => {
    //объявление объекта дял хранения характеристик проудукта
    let obj = {};
    //получение имени
    obj.name = $(row)
      .find('.o_name')
      .text();
    //получение ссылки на продукт 
    let href = $(row)
      .find('.o_name')
      .attr('href');
    //получене идентификатор из ссылки
    obj.id = get_id(href);
    //получение блока с параметрами
    let listParam = $(row).find('[ng-repeat="characteristic in dataItem.skuCharacteristics"]');
    //получение параметров
    await getListParam(listParam).then(res => {
      //добалвение параметров всвойство объекта
      obj.param = res
      //console.log("TCL: obj", obj)
    })
    parser.arr.push(obj)
  });

};

/** 
 * Получение параметров из блока
 * @async
 * @function getListParam
 * @param {Array} list Список элементов
 * @result {Object} JSON с парастрами
 * @memberof funcParse
 */
var getListParam = async list => {
  let defer = q.defer();
  //создание пустой переменной для текста
  let result = ''
  //проверка длины списка элементов
  if (list.length)
    //обход всех элементов в цикле
    await async.eachOfSeries(list, async (row, ind) => {
      //получение текста элемента
      let text = $(row).text()
      //разбиение элемента на массив
      let element = text.split(':');
      if (ind == 0) {
        //первая строка JSOn
        result = `{"${format_element(element[0])}": "${format_element(element[1])}",`
      } else {
        if (ind != list.length - 1) {
          result += `"${format_element(element[0])}": "${format_element(element[1])}",`
        } else {
          //полсденяя строка JSON
          result += `"${format_element(element[0])}": "${format_element(element[1])}"}`
        }
      }
      if (ind == list.length - 1) {
        //console.log("TCL: result", result)
        //преобразование текста в JSON
        result = JSON.parse(result)
        defer.resolve(result)
      }
    })
  return defer.promise;
}

/**
 * Форматирование элемента
 * @functuon format_element
 * @param {String} element Содержимое элемента
 * @memberof
 */
var format_element = element => {
  //удаление пробелов в начале и конце строки
  element = element.trim()
  //замена слешей
  element = element.replace(/\\/g, "||")
  //замена двойных кавычек
  element = element.replace(/(['"])/g, "\\$1")
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


/**
 * Сохранение в файл
 * @function saveToFile
 * @memberof funcParse
 */
var saveToFile = () => {
  //модуль для работы с файловой системой
  var fs = require('fs');
  //имя получаемого файла
  var filename = 'отчет.txt';
  //преобразование массива в текст
  var str = JSON.stringify(parser.arr, null, 4);

  //запись файла
  fs.writeFile(filename, str, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log(`Обработано ${parser.arr.length}`)
      console.log('Файл создан успешно');
    }
  });
}

module.exports.getDataBody = getDataBody;

module.exports.getLengthListPage = getLengthListPage;

module.exports.newTab = newTap;

module.exports.openTab = openTab;

module.exports.getListProduct = getListProduct;

module.exports.saveToFile = saveToFile;