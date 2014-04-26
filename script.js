//创建数据库
var db = openDatabase('noteapp', '1.0', '一个笔记应用', 5*1024*1024);

//创建数据表
var sql = "CREATE TABLE IF NOT EXISTS note (id INTEGER PRIMARY KEY ASC, note_content TEXT, note_date TEXT)";
db.transaction(function(tx){
  tx.executeSql(sql);      
});

//得到表单提交按钮
var submitBtn = document.getElementById("submit-btn");

//监听单击事件
submitBtn.addEventListener('click', submitNote, false);

//循环列出比较数据
loadNote();

//得到表单form
var noteForm = document.getElementById("note-form");


//定义提交表单要执行的函数
function submitNote(event){
  event.preventDefault();
  var noteContent = noteForm.elements['note-content'].value;
  var status = noteForm.elements["submit-btn"].value;
  var noteID = noteForm.elements["note-id"].value;    
  //var insertSQL = "INSERT INTO note(note_content, note_data) VALUES(?, DATETIME('now', 'localtime')," +     "[" + noteContent + "]";
  if(status === "submit"){    
    db.transaction(function(tx){
        tx.executeSql("INSERT INTO note (note_content, note_date) VALUES (?, DATETIME('now', 'localtime'))", [noteContent], onSuccess, onError);   
    });
  }
  else{
    db.transaction(function(tx){
        tx.executeSql("UPDATE note SET note_content = ? WHERE ID = ? ", 
                      [noteContent, noteID], onSuccess, Error);
                                                                         
    });  
  }

}

//循环列出数据函数
function loadNote(){
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM note ORDER BY ID DESC", [], displayNote, onError);      
  })
}

//成功后执行函数
function displayNote(tx, rs){
  console.log(rs.rows.length);   
  var noteListContainer = document.getElementById("note-list");
  noteListContainer.innerHTML = " ";    
  //console.log("id: " + rs.rows.item(0).id + "\n" +"content :" + rs.rows.item(0).note_content + "\n" + "time: " + rs.rows.item(20).note_date);
  for(var i = 0; i<rs.rows.length; i++){
    noteListContainer.innerHTML += 
        "<li class = 'list-group-item'>" +
        rs.rows.item(i).note_content +
        "<div class='btn-group btn-group-xs pull-right'>" +
        "<button class='btn btn-default' onclick='deleteNote(" + rs.rows.item(i).id + ")'>" +
        "删除" +
        "</button>" +
        "<button class='btn btn-default' onclick='editNote(" + rs.rows.item(i).id + ")'>" +
        "编辑" +
        "</button>" +
        "</div>" +
        "<small class ='pull-right note-date'>" +
        rs.rows.item(i).note_date + "</small>" + 
        "</li>";
       
  }
}

//删除数据函数
function deleteNote(id){
    var sql = "DELETE FROM note WHERE ID = " + id;
    db.transaction(function(tx){
      tx.executeSql(sql,[], onSuccess, onError);    
    });
}

//编辑笔记函数
function editNote(id){
    var sql = "SELECT * FROM note WHERE ID = " + id;
    db.transaction(function(tx){
      tx.executeSql(sql, [], function(tx, rs){
        noteForm.elements["note-content"].value = rs.rows.item(0).note_content;
        noteForm.elements["submit-btn"].value = "update";
        noteForm.elements["submit-btn"].innerHTML = "更新";
        noteForm.elements["note-id"].value = id;  
      });      
    });
}

//当执行成功后输出信息，并重新显示数据
function onSuccess(){
    console.log("ok create"); 
    loadNote();
}

//当执行错误时输出错误信息
function onError(tx, e){
    console.log("error:" + e.message)   
}