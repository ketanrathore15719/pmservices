var blockScript = {};
var blockCss = {};
var Handlebars = require('handlebars');
var util = require('handlebars-utils');
var helpers = require('handlebars-helpers')({ handlebars: Handlebars });
var moment = require('moment');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

module.exports = {
    defaultLayout: 'default',
    extname: '.hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    // Specify helpers which are only registered on this instance.
    helpers: {
        ...helpers,
        
        debug: data => console.log(data),
        tolowercase : data => {
            return data.toLowerCase();
        },
        json: obj => {
            return JSON.stringify(obj);
        },
        arrayConvert : data => {
            return [data]
        },
        stringToDashParams: data => {
           return data.toLowerCase().replaceAll(' ', '-');

        },
        removeString : data => {return data.replace('-', '')},
        getScript: position => {
            var str = "";
            if (typeof blockScript[position] != 'undefined') {
                for (i = 0; i < blockScript[position].length; i++) {
                    str += '<script src="' + blockScript[position][i] + '"></script>'
                }
                blockScript[position] = [];
            }
            return new Handlebars.SafeString(str);
        },
        
        getCss: position => {
            var str = "";
            if (typeof blockCss[position] != 'undefined') {
                for (i = 0; i < blockCss[position].length; i++) {
                    str += '<link rel="stylesheet" href="' + blockCss[position][i] + '" />'
                }
                blockCss[position] = [];
            }
            return new Handlebars.SafeString(str);
        },
        
        setScript: () => {
            var args = [];
            for (i in arguments) {
                if (typeof arguments[i] == "string")
                    args.push(arguments[i]);
            };
            var position = args.shift();
            if (typeof blockScript[position] == 'undefined') {
                blockScript[position] = [];
            }
            blockScript[position] = blockScript[position].concat(args);
        },
        
        setCss: () => {
            var args = [];
            for (i in arguments) {
                if (typeof arguments[i] == "string")
                    args.push(arguments[i]);
            };
            var position = args.shift();
            if (typeof blockCss[position] == 'undefined') {
                blockCss[position] = [];
            }
            blockCss[position] = blockCss[position].concat(args);
        },
        
        flashMe: (data) => {
            console.log(data)
            let title = (data.type == 'error' ? 'Error' : (data.type == 'info' ? 'Alert' : ''));
            let str = '<script>$.notify("'+data.message+'", "'+data.type+'");</script>'
            //let str = '<script>$.notify({title: "<strong>' + title + '</strong>",message: "' + data.message + '"},{type: "' + (data.type == 'error' ? 'danger' : data.type) + '",z_index: 20031,allow_dismiss: true,delay:10000})</script>';
            return new Handlebars.SafeString(str);
        },
        
        checkStatus: (status, _id) => {

            return new Handlebars.SafeString(``)


            return status 
                ? 
                new Handlebars.SafeString(`<p onclick="status('${_id}','${status}');" style="color:green; cursor:pointer;">Active</p>`) 
                : 
                new Handlebars.SafeString(`<p onclick="status('${_id}','${status}');" style="color:#ff0000c4; cursor:pointer;">Dective</p>`)
        },
        
        checkDestroy: (status, _id) => {

            return status 
                ? 
                new Handlebars.SafeString(`<i data-toggle="tooltip" title="Restore" onclick="destroy('${_id}','${status}');" class="bx bx-undo bx-sm"></i>`) 
                : 
                new Handlebars.SafeString(`<i data-toggle="tooltip" title="Destroy" onclick="destroy('${_id}','${status}');" class="bx bx-trash bx-sm"></i>`)
             
        },

        productCheck : (count) => {
            return count === 0 ? new Handlebars.SafeString('<p style="color:#ff0000c4;">0</p>') : new Handlebars.SafeString('<p style="color:green;">'+count+'</p>')
        },

        pagination: function (pagination) {
            if (pagination.totalPage == 1) {
                return null;
            }
            const queryString = require('query-string');
            var url_parts = pagination.url.split("?");
            var params = queryString.parse(url_parts[1]); //params={page:1,start:555,end:54545,ppp=777}
            delete params['page'] //params={start:555,end:54545,ppp=777}

            new_qry = queryString.stringify(params);
            new_url = url_parts[0] + "?" + new_qry;

            var string = '<ul class="pagination">';
            string += '<li class="paginate_button page-item previous ' + (pagination.page == 1 ? "disabled" : "") + '"><a href="' + new_url + '&page=' + (parseInt(pagination.page) - 1) + '" aria-controls="example23" data-dt-idx="0" tabindex="0"class="page-link"><i class="bx bx-chevron-left"></i></a></li>'

            index = range(pagination.page, pagination.totalPage);

            for (let i = 0; i < index.length; i++) {
                if (index[i] == '...') {
                    string += '<li class="paginate_button page-item previous ' + (index[i] == pagination.page ? "active-page" : "") + '">';
                    string += '<a aria-controls="example23" data-dt-idx="1" tabindex="0" class="page-link">' + '...' + '</a>';
                    string += '</li>';
                } else {
                    string += '<li class="paginate_button page-item previous ' + (index[i] == pagination.page ? "active-page" : "") + '">';
                    string += '<a href="' + new_url + '&page=' + index[i] + '" aria-controls="example23" data-dt-idx="1" tabindex="0" class="page-link">' + index[i] + '</a>';
                    string += '</li>';
                }
            }
            string += '<li class="paginate_button page-item next ' + (pagination.totalPage == pagination.page ? "disabled" : "") + '"><a href="' + new_url + '&page=' + (parseInt(pagination.page) + 1) + '" aria-controls="example23" data-dt-idx="7" tabindex="0" class="page-link"><i class="bx bx-chevron-right"></i></a></li>'
            string += '</ul>';
            a = range(1, 4)

            function range(c, m) {
                var current = c || 1,
                    last = m,
                    delta = 2,
                    left = current - delta,
                    right = parseInt(current) + delta + 1,
                    range = [],
                    rangeWithEllipsis = [],
                    l,
                    t;

                range.push(1);
                for (var i = c - delta; i <= c + delta; i++) {
                    if (i >= left && i < right && i < m && i > 1) {
                        range.push(i);
                    }
                }
                range.push(m);

                for (var i of range) {
                    if (l) {
                        if (i - l === 2) {
                            t = l + 1;
                            rangeWithEllipsis.push(t);
                        } else if (i - l !== 1) {
                            rangeWithEllipsis.push("...");
                        }
                    }
                    rangeWithEllipsis.push(i);
                    l = i;
                }
                return rangeWithEllipsis;
            }
            return new Handlebars.SafeString(string);
        },

        totalPrice : data => {

            const getSumByKey = (arr, key) => {
              return arr.reduce((accumulator, current) => accumulator + Number(current[key]), 0)
            }

            return getSumByKey(data, 'price');
        },

        dateAndTime : data => {
            return moment(data).format('DD-MM-YYYY hh:mm:ss a')
        }
    }
};