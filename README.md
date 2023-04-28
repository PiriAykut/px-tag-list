
## install
> npm i jquery <br><br>
> npm i px-tag-list

## css
> @import "~px-tag-list/px-tag-list.css";

## javascript - jquery
> require('px-tag-list');


## html
> \<div id="objectid"\>\</div\>

### init
> $("#objectid").pxtaglist({<br/>
>                    name: "object_name",<br/>
>                    /*use ajaxpage or data*/ <br/>
>                    ajaxpage: "api/user/content/category/list",<br/>
>                    data: [{ id: '1', text: 'Data 1' }, { id: '2', text: 'Data 2' }, { id: '3', text: 'data 3' }],<br/>
>                    addnew: false,<br/>
>                    modal: true,<br/>
>                    modal_approve_text: "Approve",<br/>
>                    modal_cancel_text: "Cancel",<br/>
>                    minheight: 70,<br/>
>                    style: "",<br/>
>                    class: "",<br/>
>                    callback: function (e) {<br/>
>                        console.log(e);<br/>
>                    }<br/>
>                });<br/>
<br/>

### using php with ajax
> **_PHP POST CODE EXAMPLE:_** <br>
> $data = $_POST["object_name"]; <br>
> $resultdata = json_decode($data); <br><br>
<br>


### description
> It is used to add a label (tag). 
> Dynamic data can be retrieved with Ajax, Javascript data can be used or data-independent user input tags can be added. 
> With the modal feature, ready data can be searched on a larger screen. 
> Autocomplate is used when writing tags. 
> it doesn't add the previously added tag again!


### view:
#### 1.
![alt text](https://raw.githubusercontent.com/PiriAykut/px-tag-list/main/Screenshot_1.jpg)

<br>

#### 2.
![alt text](https://raw.githubusercontent.com/PiriAykut/px-tag-list/main/Screenshot_2.jpg)

<br>

#### 3.
![alt text](https://raw.githubusercontent.com/PiriAykut/px-tag-list/main/Screenshot_3.jpg)
