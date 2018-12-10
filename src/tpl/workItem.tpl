<div  class = "work_item_li" data-wid="<%= wid%>" >
    <div class="work_item_info" style="display:<%= !is_violation?'none':'block' %>;">
        对不起，该作品存在违规内容，已被禁用
    </div>  
    <div  class = "work_item" data-wid="<%= wid%>"  data-useable="<%= !is_violation%>">
        <div  class="cover"  data-wid="<%= wid%>"  data-useable="<%= !is_violation%>">
            <img src="<%= cover%>">
        </div>
        <span class="content">
            <div class="div_title" >
                <span class="title" ><%= title %></span>
                <span class="time" ><%= time %></span>
            </div>
            <div class="info">
                <span ><%= summary%></span>
            </div>
            <div class="btns" >
                <span class="hits" >▶ <%= clicknum%></span>
                <span class="ops">
                    <img class="op_del" src="<%= require('../img/ico_del.png') %>" data-wid="<%= wid%>" data-useable="<%= !is_violation%>"/>
                    <img class="op_set" src="<%= require('../img/ico_set.png') %>"  data-wid="<%= wid%>"  data-useable="<%= !is_violation%>"/>
                    <img class="op_dl" src="<%= require('../img/ico_dl.png') %>" data-item='<%= data%>'  data-uid="<%= uid%>"  data-wid="<%= wid%>"  data-useable="<%= !is_violation%>"/>
                </span>
            </div>
        </span>
    </div>
</div>