$(document).ready(function(){
    var db = openDatabase('noteapp', '1.0', '一个笔记应用', 5*1024*1024);
    var sql = "CREATE TABLE IF NOT EXISTS note (id INTEGER PRIMARY KEY ASC, note_content TEXT, note_date TEXT)";
    db.transaction(function(tx){
        tx.executeSql(sql);    
    });
    
    loadNote();
    
    //单击提交更新和插入
    $("#submit-btn").click(function(event){
        event.preventDefault();
        var noteContent = $("textarea[name = note-content]").val();
        if(noteContent.trim() ===''){
            console.log("内容不能为空");
            alert("内容不能为空");
            return 
        }
        if($(this).text() === "更新"){
            var editNoteID = $("input[name = note-id]").val();
            //var myDate = new Date();
//            var updatesql = "UPDATE note SET note_content = '" + noteContent + "'," +
//                "note_date = DATETIME('now', 'localtime'))" + 
//                "WHERE ID = " + editNoteID;
//            console.log(updatesql);
            db.transaction(function(tx){
                tx.executeSql("UPDATE note SET note_content = ?, note_date = DATETIME('now', 'localtime')   WHERE ID = ?", [noteContent, editNoteID], onUpdateSuccess, onError);   
            })
            
            function onUpdateSuccess(tx, rs){
                var findHtml = "button[name = " + editNoteID + "]";
                var preNode  = $(findHtml).parent().parent();
                $(findHtml).parent().parent().remove();
            }
        }
        else{
            var insertSql = "INSERT INTO note (note_content, note_date) VALUES('" + 
                noteContent + "',DATETIME('now', 'localtime'))";
            db.transaction(function(tx){
                tx.executeSql(insertSql,[],onAddSuccess, onError);
                console.log(insertSql);
            });
        }
    });
    
    //为编辑和删除按钮委托
    $("#note-list").on('click','button', function(event){
        var ID = event.target.name
        if($(event.target).hasClass("delete")){
            var deleteSql = "DELETE FROM note WHERE ID = " + ID;
            db.transaction(function(tx){
                tx.executeSql(deleteSql, [], onDeleteSuccess, onError);   
                
            });
            
            function onDeleteSuccess(tx, rs){
                $(event.target).parent().parent().hide("slow", function(){
                    $(this).remove();   
                });
                
            }
        }
        else{
            var editSql = "SELECT * FROM note WHERE ID = " +ID
            db.transaction(function(tx){
                tx.executeSql(editSql, [], onEditSuccess, onError);
            });
            
            function onEditSuccess(tx, rs){
                var editNoteID = rs.rows.item(0).id;
                var editNoteContent = rs.rows.item(0).note_content;
                $("textarea[name = note-content]").val(editNoteContent);
                $("#submit-btn").text("更新");
                $("input[name=note-id]").val(editNoteID);
            }
        }
    });
    
    

    
    //添加成功函数
    function onAddSuccess(tx, rs){
        console.log(rs.insertId);
        var selectSql =" SELECT * FROM note WHERE ID =" +rs.insertId;
        db.transaction(function(tx){
            tx.executeSql(selectSql,[], function(tx, rs){
                var firstLi = $(".list-group-item").first();
                var html = "<li class = 'list-group-item'>" +
                    rs.rows.item(0).note_content    +
                    "<div class = 'btn-group btn-group-xs pull-right'>" +
                    "<button class= 'btn btn-default delete' name = '"    +
                    rs.rows.item(0).id  +           "'>删除</button>"    +
                    "<button class= 'btn btn-default edit' name ='"       +
                    rs.rows.item(0).id  +           "'>修改</button>"    +
                    "</div>"                                   +
                    "<small class = 'pull-right note-date'>"   +
                    rs.rows.item(0).note_date        +
                    "</small>"                       +
                    "</li>";
               $(html).insertBefore(firstLi).hide().show("slow");
            }, onError); 
            
        });        
    }
    
    //加载所有笔记
    function loadNote(){
        var selctSql = "SELECT * FROM note ORDER BY ID DESC";
        db.transaction(function(tx){
            tx.executeSql(selctSql, [], displayNote, onError);
               
        });
        
    }
    
    function displayNote(tx, rs){
        var html = "";
        //console.log(rs.rows);
        for(var i = 0; i<rs.rows.length; i++){
            html += "<li class = 'list-group-item'>" +
                     rs.rows.item(i).note_content    +
                    "<div class = 'btn-group btn-group-xs pull-right'>" +
                    "<button class= 'btn btn-default delete' name = '"  +
                    rs.rows.item(i).id            + "'>删除</button>"    +
                    "<button class= 'btn btn-default edit' name = '"+
                    rs.rows.item(i).id            + "'>修改</button>"    +
                    "</div>"                         +
                    "<small class = 'pull-right note-date'>"   +
                     rs.rows.item(i).note_date       +
                    "</small>"                       +
                    "</li>";
        }   
        $("#note-list").html(html).hide().slideDown(1000);
    }
    
    
    
    
    
    
    
    function onSuccess(tx, rs){
        console.log("ok");
        loadNote();
    }
    
    function onError(tx, e){
        console.log("error :" + e.message);
    }
});