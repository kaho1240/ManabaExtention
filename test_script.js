let classNames = document.querySelectorAll(".course.course-cell");

// 必要なオブジェクト
let Classes = []; // 授業名を入れる配列
let ClassNumArray = new Array(15); // 授業番号を入れる配列
let AssignHerf = new Array(15); // 課題の名前

let countClass = 0; // クラスを数える
let count = 0;
let herfCount = 0; // 取得したURLの数
let getTestInfoCount = 0;

// 授業の情報を取ってくる
SearchInfo(classNames, ClassNumArray); // 時間割取得

function SearchInfo(name, List) {
    name.forEach(element => {
        let text = element.textContent;
        let newTextElement = document.createElement("div"); 
        newTextElement.textContent = text.trim();
        let ClassText = text.replace(/\s+/g, ''); // 授業名＋教室
        List[countClass] = ClassText;
        countClass++;
    });
    console.log(countClass);
    for (let i = 0; i < List.length; i++) {
        if (List[i] != null) {
            // console.log(List[i]);
        }
    }
    let separator = document.createElement("div");
    separator.textContent = "-------";
    document.body.appendChild(separator);
}

function getTestInfo(classAssignNum, ClassName) {
    fetch("https://ct.ritsumei.ac.jp/ct/syllabus_8" + classAssignNum)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const elements = doc.querySelectorAll("td");
            getTestInfoCount++;

            for (let i = 9; i < 53; i += 3) {
                const element = elements[i];
                if (element && element.textContent !== undefined) {
                    const text = element.textContent.trim();
                    if (text && (text.includes("テスト") || text.includes("試験"))) {
                        Classes.push((i / 3) - 2 + text);
                        Classes.push(ClassName);
                        Classes.push(elements[i-1].textContent.trim());
                    }
                } else {
                    break;
                }
            }
            if (getTestInfoCount == countClass) {
                for (let i = 0; i < Classes.length; i++) {
                    if (i % 3 == 0) {
                        console.log(i / 3);
                    }
                    console.log(Classes[i]);
                }
                TableDisplay(); // 全てのデータが収集されたらテーブルを表示
            }
        })
        .catch(error => console.log("Fetch error:", error));
}

function getAssignInfo() {
    fetch("https://ct.ritsumei.ac.jp/ct/home_course")
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const elements = doc.querySelectorAll("td");
            for (let i = 0; i < ClassNumArray.length * 4; i++) {
                let element = elements[i];
                let text = element.textContent.trim();
                text = text.replace(/\s+/g, ''); 
                const firstChar = text.substring(0, 1);
                const firstFourChars = text.substring(0, 4);
                if (firstFourChars !== "2024" && /^\d$/.test(firstChar)) {
                    const link = element.querySelector('a');
                    if (link) {
                        const href = link.href;
                        let lastFiveHref = href.slice(-6);
                        let alreadyExists = false;
                        for (let j = 0; j < AssignHerf.length; j++) {
                            let preHerf = AssignHerf[j];
                            if (preHerf != null && preHerf.length > 5) {
                                let firstFivepre = preHerf.slice(0, 6);
                                if (AssignHerf[j] !== null && lastFiveHref === firstFivepre) {
                                    alreadyExists = true;
                                    break;
                                }
                            }
                        }
                        if (!alreadyExists) {
                            let startIndex = 6; // 7文字目から始まる
                            let endIndex = text.indexOf("("); // 括弧が始まる位置を取得
                            let extracted = text.substring(startIndex, endIndex); 
                            AssignHerf[herfCount] = lastFiveHref;
                            getTestInfo(lastFiveHref, extracted);
                            herfCount++;
                        }
                    }
                }
            }
        })
        .catch(error => console.log("Fetch error:", error));
}

function TableDisplay() {
    // tableContainerというIDを持つdiv要素を作成して、bodyに追加する
    var div = document.createElement('div');
    div.id = 'tableContainer';
    document.body.appendChild(div); // div を body の最後に追加

    var table = document.createElement('table');
    table.id = 'myTable';
    
    // テーブルヘッダーの作成
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    
    var headers = ['数', '科目', 'テスト', '日程'];
    headers.forEach(function(header) {
        var th = document.createElement('th');
        th.textContent = header;
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // テーブルボディの作成
    var tbody = document.createElement('tbody');
    var data = [];
    for (var i = 0; i < Classes.length; i += 3) {
        var array = [(i / 3) + 1, Classes[i], Classes[i+1], Classes[i + 2]];
        data.push(array);
    }

    data.forEach(function(rowData) {
        var row = document.createElement('tr');
        rowData.forEach(function(cellData, index) {
            var td = document.createElement('td');
            td.textContent = cellData;


            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    div.appendChild(table);

    // スタイルの定義と追加
    var style = document.createElement('style');
    style.innerHTML = `
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 0.5px solid black;
            padding: 8px;
            font-size: 12px;
        }
        th {
            background-color: rgba(255, 255, 0, 0.5);
        }
        td {
            background-color: rgba(255, 255, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}
// テーブルを表示する関数を呼び出す
getAssignInfo();