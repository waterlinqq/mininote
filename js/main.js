(function () {
    'use strict'
    var $addTask = $('.add-task'),//提交區塊div
        $input = $addTask.find('input'),//提交區塊內容input
        $taskList = $('.task-list'),//清單內容ul
        $taskDetail = $('.task-detail'),//清單詳細modal
        $taskDetailMask = $('.task-detail-mask'),//開啟清單modal時的遮罩div
        taskList = [],
        $remindTime = $('.remind .datetime'),//提醒時間input
        $update = $('.remind button[type="submit"]'),//modal更新按鈕button
        $alertDeleteMask = $('.alert-delete-mask'),//確認刪除遮罩
        $alertDelete = $('.alert-delete'),//確認刪除框
        deleteIndex, //要刪除的編號
        $notice = $('.notice')//提醒時間到

    //初始化
    function init() {
        console.log('init')
        //查看taskList內容，如果有就渲染內容 如果沒有則定義空陣列
        taskList = store.get('taskList') || []
        if (taskList.length) renderTaskList()
    }

    //監聽提交按鈕  
    function listenSubmitButton() {
        console.log('listenSubmitButton')
        $addTask.on('submit', function (e) {
            e.preventDefault();
            console.log('submit')
            //定義一個空項目 將輸入框內容傳給項目content屬性
            var newTask = {}
            newTask.content = $input.val()
            //如果輸入框為空 返回
            if (!newTask.content) return
            //清空輸入框
            $input.val(null)
            //添加到storage
            addTask(newTask);
        })
    }

    //添加到storage
    function addTask(item) {
        console.log('addTask')
        taskList.push(item);
        store.set('taskList', taskList);
        //渲染項目內容
        renderTaskList()
    }

    //渲染內容
    function renderTaskList() {
        console.log('renderTaskList')
        //先清空所有內容
        $taskList.html('')
        for (var i = 0; i < taskList.length; i++) {
            //如果項目存在沒被刪除的話
            if (taskList[i]) {
                //查看該項目是否被完成
                var checked = taskList[i].complete ? "checked" : ""
                var task =
                    `<li class="task-item ${checked} " data-index="${i}">
                <label for="${i}" class="task-content"><input type="checkbox" ${checked}>${taskList[i].content}</label>
                <span class="task-info">詳情</span>
                <span class="delete">刪除</span>
                </li>`
                //從內部最前面加入
                $taskList.prepend(task)
            }
        }
        listenDeleteButton()//監聽刪除
        listenDetailButton()//監聽詳細
        listenCheckbox()//監聽完成勾選框
    }

    //監聽刪除鍵
    function listenDeleteButton() {
        console.log('listenDeleteButton')
        var $deleteButton = $('.delete')//刪除鍵
        $deleteButton.on('click', function () {
            console.log('deleteButtonClick')
            //獲取項目的index
            deleteIndex = $(this).parent().data('index')
            //先確定是否刪除
            popConfirm()
        })
    }

    //確定是否刪除
    function popConfirm() {
        console.log('popConfirm')
        //顯示提醒框
        $alertDelete.find('.name').text(taskList[deleteIndex].content)
        $alertDeleteMask.show()
        $alertDelete.show()
        //監聽刪除框關閉
        listenConfirmClose()
        //監聽刪除或是取消
        $alertDelete.children(':button').off().on('click', deleteTaskOrNot)
    }

    //監聽刪除框關閉
    function listenConfirmClose() {
        console.log('listenConfirmClose')
        //阻止事件冒泡 避免點confirm框就關閉
        $alertDelete.off().on('click', function (e) {
            console.log('e.stopPropagation')
            e.stopPropagation()
        })
        //讓confirm遮罩監聽點擊關閉
        $alertDeleteMask.off().on('click', function (e) {
            console.log('hideDeleteMask')
            $alertDeleteMask.hide()
            $alertDelete.hide()
        })
    }

    //執行刪除或是取消
    function deleteTaskOrNot() {
        console.log('deleteTaskOrNot')
        //獲取該按鈕的data-confirm屬性
        var confirmed = $(this).data('confirm')
        if (confirmed) {
            //找到該項目並移除
            $taskList.find('[data-index="' + deleteIndex + '"]').remove()
            //將該項目位置清空
            delete taskList[deleteIndex]
            //保存localstorage
            store.set('taskList', taskList)
            //重新渲染項目內容
            renderTaskList()
        }
        //隱藏提醒框
        $alertDeleteMask.hide()
        $alertDelete.hide()
    }


    //監聽詳細鍵
    function listenDetailButton() {
        console.log('listenDetailButton')
        $('.task-info').on('click', function () {
            console.log('task-info Click')
            //獲取項目內容
            console.log(this)
            var title = $(this).prev().text()
            var index = $(this).parent().data('index')
            var desc = taskList[index].desc
            var date = taskList[index].date
            //替換modal內所有內容成項目內容
            $taskDetail.find('input[type="text"]').val(title)
            $taskDetail.find('textarea').val(desc)
            $taskDetail.find('.datetime').val(date)
            //顯示modal與遮罩
            $taskDetail.show()
            $taskDetailMask.show()
            //監聽modal更新
            listenUpdateButton(index)
            //監聽modal關閉
            listenDeleteButtonClose()
        })
    }

    //監聽modal更新
    function listenUpdateButton(index) {
        //需先解除綁定後再添加監聽
        $update.off().on('click', function () {
            console.log('update click')
            //定義一個空項目 其屬性內容為當前modal各個Input值
            var newTask = {}
            newTask.content = $taskDetail.find('input[type="text"]').val()
            newTask.desc = $taskDetail.find('textarea').val()
            newTask.date = $taskDetail.find('.datetime').val()
            //將新的項目覆蓋掉原本的項目
            taskList[index] = newTask
            store.set('taskList', taskList)
            renderTaskList()
            //並且隱藏modal
            $taskDetail.hide()
            $taskDetailMask.hide()
        })
    }

    //監聽modal關閉
    function listenDeleteButtonClose() {
        //阻止事件冒泡 避免點modal就關閉
        $taskDetail.off().on('click', function (e) {
            console.log('e.stopPropagation')
            e.stopPropagation()
        })
        //讓modal遮罩監聽點擊關閉
        $taskDetailMask.off().on('click', function (e) {
            console.log('taskDetailMask click')
            $taskDetail.hide()
            $taskDetailMask.hide()
        })
    }

    //監聽完成勾選框
    function listenCheckbox() {
        console.log('listenCheckbox')
        var $checkBoxes = $('.task-content input');
        $checkBoxes.on('change', function (e) {
            console.log('$checkBoxes change')
            //從該選框獲取到祖父元素的data index值 
            var index = $(e.target).parent().parent().data('index')
            //修改該項目complete屬性
            taskList[index].complete = !taskList[index].complete
            store.set('taskList', taskList)
            renderTaskList()
        })
    }

    //檢查是否有項目時間並進行提醒
    function taskRemindCheck() {
        console.log('taskRemindCheck')
        //每秒都必須檢查一次
        setInterval(function () {
            for (var i = 0; i < taskList.length; i++) {
                if (!taskList[i] || !taskList[i].date || taskList[i].informed) continue;
                if (Date.now() > new Date(taskList[i].date).getTime()) {
                    //將項目添加已提醒屬性
                    taskList[i].informed = true;
                    store.set('taskList', taskList)
                    //執行提醒
                    alarm(taskList[i])
                }
            }
        }, 1000)
    }

    //執行提醒
    function alarm(item) {
        console.log('alarm')
        //清空notice文字
        $notice.text('')
        $notice.append('提醒您' + item.content + '時間到了，點我關閉')
        $notice.show()
        //轉成dom元素
        $('.audio').get(0).play()
        //解除綁定在監聽
        $notice.off().on('click', function () {
            console.log('$notice click')
            $notice.hide()
            $('.audio').get(0).pause()
            $('.audio').get(0).currentTime = 0
        })
    }

    //初始化
    init();
    //監聽提交按鈕
    listenSubmitButton();
    //修改預設樣式
    $remindTime.datetimepicker();
    //檢查是否有項目時間並進行提醒
    taskRemindCheck()


})()