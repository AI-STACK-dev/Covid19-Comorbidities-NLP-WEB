
//python import! 변수명은 as!

module.exports={
    HTML:function(title, body, control) {
        return `
        <!DOCTYPE html>
        <html lang="ko-KR">
        
        <head>
          <meta charset="UTF-8" />
          <title>COVID-19 Risk Factor - ${title}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous" />
          <link href="https://fonts.googleapis.com/css?family=Nanum+Gothic&display=swap" rel="stylesheet" />
        </head>
        
        <body>
          <h3><a href="/">COVID-19 Risk Factor</a></h3>
          <div id="wrap">
            <div id="header">
              <div class="container">
                <div class="header">
                  <div class="header-menu" style="text-align: right">
                    <a href="https://github.com/programmer-ethan/Covid19-RiskFactor-NLP-WEB">Git</a>
                  </div>
                  <!-- //헤더 메뉴 -->
                  <div class="header-tit">
                    <h1>Covid Risk Factor Guide</h1>
                    <br /><br /><br /><br /><br />
                  </div>
                  <div class="header-icon"></div>
                </div>
              </div>
            </div>
            <!-- <div id="nav">nav</div>
        <div id="side">side</div> -->
            <div id="contents">
              <div class="container">
                <div class="row">
                  <form method="post" action="/topic/submit">
                    <div class="col">
                      <h3>Risk Factor</h3>
                      <ul>
                        <input type="checkbox" name="RiskFactor" value="Cancer" />
                        Cancer<br />
                        <input type="checkbox" name="RiskFactor" value="Cerebrovascular disease" />
                        Cerebrovascular disease<br />
                        <input type="checkbox" name="RiskFactor" value="COPD (chronic obstructive pulmonary disease)" />
                        COPD (chronic obstructive pulmonary disease)<br />
                        <input type="checkbox" name="RiskFactor" value="Chronic kidney disease" />
                        Chronic kidney disease<br />
                        <input type="checkbox" name="RiskFactor" value="Diabetes mellitus, type 1 and type 2" />
                        Diabetes mellitus, type 1 and type 2<br />
                        <input type="checkbox" name="RiskFactor"
                          value="Heart conditions (such as heart failure, coronary artery disease, or cardiomyopathies)" />
                          Heart conditions (such as heart failure, coronary artery disease, or cardiomyopathies)<br />
                        <input type="checkbox" name="RiskFactor"
                          value="Obesity (BMI ≥30 kg/m2)" />
                          Obesity (BMI ≥30 kg/m2)<br />
                        <input type="checkbox" name="RiskFactor" value="Pregnancy" />
                        Pregnancy<br />
                        <input type="checkbox" name="RiskFactor" value="Smoking, current and former" />
                        Smoking, current and former<br />
                      </ul>
                    </div>
                    <div class="col">
                    <h3>Your Own Risk Factor</h3>
                    <div class="topnav">
                      <input type="text" name="RiskFactor" placeholder="Search.." />
                    </div>
                  </div>
                    <p>
                      <input type="submit" value="Discover" />
                      <input type="reset" value="Reset" />
                    </p>
                  </form>
                </div>
                <div class="row">
                  ${body} ${control}
                </div>
              </div>
            </div>
            <div id="footer">© 2021 capstone</div>
          </div>
        </body>
        </html>  
        `;
      },
      list:function(filelist) {
        var list = "<ul>";
        var i = 0;
        while (i < filelist.length) {
          list = list + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
          i = i + 1;
        }
        list = list + "</ul>";
        return list;
      }
}

