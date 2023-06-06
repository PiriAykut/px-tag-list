
(function ($) {
    $.fn.pxtaglist = function (options, _data) {
        var id = "px-tag-list-" + pxGenerateUUID();
        var mainclass = "px-tag-list";
        var self = this;

        if (self.hasClass(mainclass))
            return;

        var defaults = {
            name: '',
            data: null,
            addnew: true,
            ajaxpage: null,
            // ajax_query_objects: null,
            minheight: '50',
            // maxheight: '300',
            modal: false,
            modal_approve_text: "Approve",
            modal_cancel_text: "Cancel",
            style: null,
            class: null,
            placeholder: null,
            callback: null
        };

        options = $.extend(defaults, options);

        if (options.name == null || options.name == '') {
            let _no = 0;
            while (true) {
                _no++;
                if ($(`[name='tag_${_no}']`).length == 0) {
                    break;
                }
            }

            options.name = "tag_" + _no;
        }

        let _html = `
            <ul class="tag-list"><li><input type="text" id="input${options.name}" value=""/></li></ul>
            <input type="hidden" class="tagdata" name="${options.name}" />
            <ul class="data-list"></ul>`;

        if (options.modal) {
            _html += `<button type="button" class="btn-px-tag-modal">...</button>
                    <div class="px-tag-modal-bottom">
                        <div class="px-tag-modal">
                            <input type="text" class="filter" value=""/>
                            <ul></ul>

                            <button type="button" class="approve" data-text="${options.modal_approve_text}">${options.modal_approve_text}</button>
                            <button type="button" class="cancel">${options.modal_cancel_text}</button>
                        </div>
                    </div>`;
        }

        self.attr("px-id", id).addClass(mainclass).append(_html);

        if (options.modal) {
            self.css("padding-right", "35px");
        }

        if (options.style != null && options.style != "") {
            self.attr("style", options.style);
        }
        if (options.class != null && options.class != "") {
            self.addClass(options.class);
        }
        if (options.minheight != null && options.minheight != "") {
            if (options.minheight.toString().isNumeric()) options.minheight += 'px';

            self.css("min-height", options.minheight);
        }

        if (options.data != null && typeof options.data == "string") {
            if (options.data == null || options.data == "") {
                options.data = null;
            } else {
                options.data = JSON.parse(options.data);
            }
        }

        // if (options.maxheight != null && options.maxheight != "") {
        //     if (options.maxheight.isNumeric()) options.maxheight += 'px';
        //     self.css("max-height", options.maxheight);
        // }

        let _id = "[px-id='" + id + "'] ";

        // $(window).bind('click', function (event) {
        //     if ($(event.target).hasClass(mainclass) || $(event.target).parents('ul').hasClass('result-container') || $(event.target).parents().hasClass('search-container')) {
        //         return;
        //     }
        //     if ($(".result-container.open").length > 0) {
        //         $(".result-container.open").removeClass("open")
        //     }
        // });


        $("body")
            .on("click", _id, function (e) {
                if ($(e.target).parents(".px-tag-modal").length == 0) {
                    $(_id + "ul.tag-list li input").focus();
                }

            })
            .on("click", _id + ".btn-px-tag-modal", function () {
                openDatalistModal();
            })
            .on("change", _id + ".px-tag-modal-bottom .px-tag-modal ul li label input[type='checkbox']", function () {
                setApproveCaption();
            })
            .on("input", _id + ".px-tag-modal-bottom .px-tag-modal .filter", function () {
                let _txt = $(this).val().trim();

                if (_txt != "") {
                    _txt = _txt.toTrLowerCasePxAuto();

                    $(_id + ".px-tag-modal-bottom .px-tag-modal ul li").show().filter(function () {
                        dInput = $(this).text().replace(/\s+/g, ' ').toTrLowerCasePxAuto();
                        return !~dInput.indexOf(_txt);
                    }).hide();
                } else {
                    $(_id + ".px-tag-modal-bottom .px-tag-modal ul li").show();
                }
            })
            .on("click", _id + ".px-tag-modal-bottom .px-tag-modal button.approve", function () {
                approveDataListModal();
            })

            .on("click", _id + ".px-tag-modal-bottom .px-tag-modal button.cancel", function () {
                cancelDataListModal()
            })
            .on("input", _id + "ul.tag-list li input", function () {
                $(this).css("width", ((8 * $(this).val().length) + 10) + "px");

                if ($(this).val().trim() == "") {
                    closeDataList();
                } else {
                    openDataList($(this));
                }
            })
            .on("keydown", _id + "ul.tag-list li input", function (e) {

                switch (e.which) {
                    case 27: //escape
                        $(this).val("");
                        closeDataList();
                        break;
                    case 13: //enter
                    case 9: //tab
                        addTag(0, $(this).val());

                        closeDataList();
                        break;
                    case 40: //bottom arrow
                        $(_id + "ul.data-list li:eq(0)").focus();
                        setDataListScroll();
                        break;
                    ///return false;
                }
            })
            .on("blur", _id + "ul.tag-list li input", function (e) {
                setTimeout(() => {
                    if ($(_id + "ul.data-list li:focus").length > 0) return;

                    addTag(0, $(_id + "ul.tag-list li input").val());

                    closeDataList();
                }, 500);
            })
            .on("click", _id + "ul.tag-list li i", function () {
                removeTag($(this).parents("li"));
                // return false;
            })
            .on("click", _id + "ul.data-list li", function () {
                let _id = $(this).attr("data-id");
                let _text = $(this).text();

                addTag(_id, _text, true);

                return false;
            })
            .on("keydown", _id + "ul.data-list li", function (e) {
                if (e.which == 40 || e.which == 38) {
                    let tabindex = parseInt($(this).attr("tabindex"));
                    if (e.which == 38) {
                        tabindex--;
                        if (tabindex == 1) {
                            tabindex = $(_id + "ul.data-list li").length;
                        }
                    } else {
                        tabindex++;
                    }

                    if ($(_id + "ul.data-list li[tabindex='" + tabindex + "']").length == 0) {
                        tabindex = 1;
                    }

                    $(_id + "ul.data-list li[tabindex='" + tabindex + "']").focus();

                    setDataListScroll();
                } else if (e.which == 13) {
                    $(_id + "ul.data-list li:focus").trigger("click");
                }
            })
            ;

        setTimeout(() => {
            if (options.data != null && options.data.length > 0) {
                for (let i = 0; i < options.data.length; i++) {
                    const el = options.data[i];

                    addTag(el.id, el.text, true);
                }
            }
        }, 500);

        function setApproveCaption() {
            let _count = $(_id + ".px-tag-modal-bottom .px-tag-modal ul li label input[type='checkbox']:checked").length;
            let _btn = $(".px-tag-modal-bottom .px-tag-modal button.approve");

            _btn.html(_btn.attr("data-text") + (_count > 0 ? " (" + _count + ")" : ""));
        }

        function openDatalistModal() {
            $(_id + ".px-tag-modal-bottom").css("display", "block");
            $(_id + ".px-tag-modal-bottom .px-tag-modal ul").html("");

            $("body").css("overflow", "hidden");

            setApproveCaption();

            runajax("", function (_data) {
                let _jdata = $(_id + ".tagdata").val();
                if (_jdata != "") {
                    _jdata = JSON.parse(_jdata);
                }

                for (let i = 0; i < _data.length; i++) {
                    const el = _data[i];
                    let _selected = false;

                    if (_jdata.length > 0) {
                        _selected = _jdata.filter(_row => { return parseInt(_row.id) === parseInt(el.id); }).length > 0;
                    }

                    let _li = `<li>
                                    <label>
                                        <input type="checkbox" value="${el.id}" ${_selected ? 'checked="true"' : ''}/>
                                        <span> ${el.text}</span>
                                    </label >
                                </li > `;

                    $(_id + ".px-tag-modal-bottom .px-tag-modal ul").append(_li);
                }

                $(_id + ".px-tag-modal-bottom .px-tag-modal .filter").focus();
            });
        }

        function approveDataListModal() {
            let _selected = $(_id + ".px-tag-modal-bottom .px-tag-modal ul li label input[type='checkbox']:checked");

            cleanSelectedTags();

            if (_selected.length > 0) {
                _selected.each(function () {
                    let _id = $(this).val();
                    let _text = $("span", $(this).parent()).text();

                    addTag(_id, _text, true);
                });
            }

            cancelDataListModal();
        }
        function cancelDataListModal() {
            $(_id + ".px-tag-modal-bottom .px-tag-modal ul").html("");
            $(_id + ".px-tag-modal-bottom").css("display", "none");

            $("body").css("overflow", "auto");
        }
        function setDataListScroll() {
            let tabindex = parseInt($(_id + "ul.data-list li:focus").attr("tabindex"));
            let height = $(_id + "ul.data-list li").height() + 8;
            let offsetTop = (height * (tabindex - 1)) - 32;

            $(_id + "ul.data-list").scrollTop(offsetTop);
        }

        function openDataList(_input) {
            if ((options.ajaxpage == null || options.ajaxpage == "") && (options.data == null || options.data.length == 0)) return;

            if (_input.val().trim() == "") {
                closeDataList();
                return;
            }

            if (options.ajaxpage != null && options.ajaxpage != "") {
                runajax(_input.val().trim(), function (_snc) {
                    setDataList(_input, _snc);
                });
            } else {
                let _snc = options.data.filter(_row => { return _row.text.toTrLowerCasePxAuto().indexOf(_input.val().trim().toTrLowerCasePxAuto()) > -1 });

                setDataList(_input, _snc);
            }

        }

        function setDataList(_input, _snc) {
            if (_snc.length == 0) {
                closeDataList();
                return;
            }

            let _tagindex = 0;
            let _lilist = _snc.map(_row => { _tagindex++; return '<li tabindex="' + _tagindex + '" data-id="' + _row.id + '">' + _row.text + '</li>' }).join('');

            $(_id + "ul.data-list")
                .html(_lilist)
                .css("display", "grid")
                .css("left", _input.position().left + "px")
                .css("top", (_input.position().top + _input.height() + 15) + "px");

        }

        function closeDataList() {
            $(_id + "ul.data-list").html("").css("display", "none");
        }

        function addTag(_dataid, _datatext, _datalist = false) {
            if (_datatext == null || _datatext.trim() == "") return;
            _datatext = _datatext.trim();

            if (!options.addnew && !_datalist) {
                $(_id + "ul.tag-list li input").val("");

                return;
            }

            let _controlObj = null;
            $(_id + "ul.tag-list li .tag").each(function () {
                if ($("span", $(this)).text() == _datatext) {
                    _controlObj = $(this).parent();
                    _controlObj.addClass("px-alert");
                    return;
                }
            });

            if (_controlObj != null) {
                setTimeout(() => {
                    _controlObj.removeClass("px-alert");
                }, 5000);

                return;
            }

            $(_id + "ul.tag-list li input").parent().before(`<li> <div class="tag"><span data-id="${_dataid}">${_datatext}</span><i>x</i></div></li> `);
            $(_id + "ul.tag-list li input").val("").focus();

            let _jdata = $(_id + ".tagdata").val();
            if (_jdata == "") {
                _jdata = [{ id: _dataid, text: _datatext }];
            } else {
                _jdata = JSON.parse(_jdata);
                _jdata.push({ id: _dataid, text: _datatext });
            }

            $(_id + ".tagdata").val(JSON.stringify(_jdata));

            if (options.callback != null) {
                if (options.callback.length > 0) {
                    options.callback(_jdata);
                } else {
                    options.callback();
                }
            }

            closeDataList();
        }

        function cleanSelectedTags() {
            $(_id + "ul.tag-list li .tag").each(function () {
                $(this).parent().remove();
            });
            $(_id + ".tagdata").val("");
        }

        function removeTag(_li) {
            let _text = $(".tag span", _li).text();
            let _jdata = $(_id + ".tagdata").val();

            if (_jdata != "") {
                _jdata = JSON.parse(_jdata);
                _jdata = _jdata.filter(_row => { return _row.text != _text; });
            }

            $(_id + ".tagdata").val(JSON.stringify(_jdata));

            _li.remove();
        }

        function runajax(_text, _callback) {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': ($('meta[name="csrf-token"]').length > 0 ? $('meta[name="csrf-token"]').attr('content') : '')
                },
                type: "POST",
                url: window.location.origin + "/" + options.ajaxpage,
                data: "text=" + encodeURIComponent(_text),
                timeout: 15000,
                success: function (e) {
                    if (e === null) {
                        e = [];
                    } else {
                        try {
                            e = JSON.parse(e);
                        } catch (e) {
                            e = [];
                        }
                    }

                    _callback(e);
                },
                error: function (err) {
                    let _msj = "Error px-tag-list ajax : " + err.status + "\n" + err.statusText;

                    console.error(_msj);
                    console.error(err);
                }
            });
        }
    }
})(jQuery);

function pxGenerateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
String.prototype.toTrLowerCasePxAuto = function () {
    //     if((typeof this)!=='string')
    //        return this;
    try {
        var str = [];
        for (var i = 0; i < this.length; i++) {
            var ch = this.charCodeAt(i);
            var c = this.charAt(i);

            if (ch === 304) str.push('i');
            else if (ch === 73) str.push('ı');
            else if (ch === 286) str.push('ğ');
            else if (ch === 220) str.push('ü');
            else if (ch === 350) str.push('ş');
            else if (ch === 214) str.push('ö');
            else if (ch === 199) str.push('ç');
            else if (ch === 399) str.push('ə');
            else if (ch >= 65 && ch <= 90)
                str.push(c.toLowerCase());
            else
                str.push(c);
        }
        return str.join('');
    } catch (error) {
        return '';
    }
};
String.prototype.isNumeric = function () {
    let str = this.toString();

    if (typeof str != "string") return false // we only process strings!  

    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
};
String.prototype.replaceAll = function (search, replacement) {
    //     if((typeof this)!=='string')
    //      
    //          return this;
    var target = this;
    return target.split(search).join(replacement);
};
