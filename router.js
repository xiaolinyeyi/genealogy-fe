function dispatch(event) {
    let scheme = location.hash.split("#")[1]
    let defaultScheme = "genealogyTree"
    if (scheme == null) {
        location.hash = defaultScheme
        return
    }
    let path = defaultScheme
    let queryParams = new Map()
    let pathAndQuery = scheme.split("?")
    if (pathAndQuery != null) {
        path = pathAndQuery[0]

        let query = pathAndQuery[1]
        if (query != null) {
            let queryArr = query.split("&")
            for (let i = 0; i < queryArr.length; i++) {
                let kv = queryArr[i].split("=")
                queryParams[kv[0]] = kv[1]
            }
        }
    }

    let oldPath = ""
    if (event) {
        let oldURL = event.oldURL
        let oldScheme = oldURL.split("#")[1]
        if (oldScheme != null) {
            oldPath = oldScheme.split("?")[0]
        }
    }
    if (oldPath != path) { // 需要重新加载js
        removeFile("./" + oldPath + ".js")
        removeFile("./" + oldPath + ".css")
        loadFile("./" + path + ".js", callback = function() {
            let handler = eval(path + "Handler")
            handler(queryParams, document.getElementById("content"))
        })
        loadFile("./" + path + ".css", callback = function() {})
    } else {
        let handler = eval(path + "Handler")
        handler(queryParams, document.getElementById("content"))
    }
}

function getType(file){
    var filename = file;
    var index1 = filename.lastIndexOf(".");
    var end = filename.length;
    var type = filename.substring(index1 + 1, end);
    return type;
}

//动态加载一个js/css文件
function loadFile(filename, callback) {
    let filetype = getType(filename)
    if (filetype == "js") {
        var fileref = document.createElement('script')
        fileref.setAttribute("src", filename)
    } else if (filetype == "css") {
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref)
        fileref.onload = function() {
            callback()
        }
    }
}

function removeFile(filename) {
    let filetype = getType(filename)
    var targetelement = (filetype == "js") ? "script" : (filetype == "css") ? "link" : "none"
    var targetattr=(filetype=="js")? "src" : (filetype == "css")? "href" : "none"
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--) {
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1) {
            allsuspects[i].parentNode.removeChild(allsuspects[i])
        }
    }
}