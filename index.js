let input = document.getElementById("upload");
        let container = document.getElementById("container");

        let files=null;

        function getfile(e) {
            files = e.files[0]; 
            document.getElementById("fName").innerText=files.name;           
        }

        function startExt() {
            if(files!=null)
            {
                document.getElementById("download").style.display="block";
                document.getElementsByClassName("frame")[0].style.display="none";
                container.style.display="block";
                handleFile(files);
            }
        }

        // Closure to capture the file information.
        function handleFile(f) {
            JSZip.loadAsync(f) // 1) read the Blob
                .then(
                    function (zip) {
                        let ZIP = [];
                        let download = {};
                        zip.forEach(function (relativePath, zipEntry) {
                            let arr = zipEntry.name.split("/");
                            let temp = {};
                            if (arr[0] == zipEntry.name) {
                                temp["id"] = arr[0];
                                temp["text"] = arr[0];
                                temp["parent"] = "#";
                                zip.file(relativePath).async("blob").then(function (data) {
                                    download[arr[0]] = window.URL.createObjectURL(data);
                                });
                            } 
                            else if (arr[arr.length - 1] == "") {
                                temp["id"] = arr[arr.length - 2];
                                temp["text"] = arr[arr.length - 2];
                                if (arr[arr.length - 3] != null) {
                                    temp["parent"] = arr[arr.length - 3];
                                } else {
                                    temp["parent"] = "#";
                                }
                                download[arr[arr.length - 2]] = "#";
                            } 
                            else {
                                temp["id"] = arr[arr.length - 1];
                                temp["text"] = arr[arr.length - 1];
                                temp["parent"] = arr[arr.length - 2];
                                zip.file(relativePath).async("blob").then(function (data) {
                                    download[arr[arr.length - 1]] = window.URL.createObjectURL(data);
                                });
                            }
                            ZIP.push(temp);
                        });
                        $('#container').jstree({
                            core: {
                                data: ZIP
                            },
                        })
                        .on('select_node.jstree', function(e, data){
                                if(download[data.node.text]!="#") {
                                let a = document.createElement('a');
                                a.href=download[data.node.text]; 
                                a.download=data.node.text; 
                                a.click(); 
                            } 
                        });
                        document.getElementById('download').addEventListener("click",function (evt){
                            evt.preventDefault(); 
                            let keys = Object.keys(download); 
                            keys.forEach( function(key){
                                if(download[key]==="#") return;
                                let a = document.createElement('a'); 
                                a.href=download[key]; a.download=key; 
                                a.click(); 
                            }); 
                        });
                    },
                    function (e) {
                        container.innerHTML="<div> Error reading " + f.name + ": " + e.message+"</div>"
                    }
                );
        }