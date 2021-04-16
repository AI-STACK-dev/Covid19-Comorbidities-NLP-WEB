
//python import! 변수명은 as!

module.exports={
    HTML:function(title, body, control) {
        return `
        <!DOCTYPE html>
        <html lang="ko-KR">
        
        <head>
          <meta charset="UTF-8" />
          <title>COVID-19 Risk Factor - ${title}</title>
          <link rel="stylesheet" href="/CSS/style.css">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous" />
          <link href="https://fonts.googleapis.com/css?family=Nanum+Gothic&display=swap" rel="stylesheet" />
        </head>
        
        <body>
          <div id="wrap">
            <div id="header" style="background-image: url('/images/covid3.jpg');">
              <div class="container">
                <div class="header">
                  <div class="header-menu" style="text-align: right">
                    <a href="/">COVID-19 Risk Factor</a>
                    <a href="https://www.cdc.gov/coronavirus/2019-ncov/hcp/clinical-care/underlyingconditions.html">CDC</a>
                    <a href="https://github.com/programmer-ethan/Covid19-RiskFactor-NLP-WEB">Git</a>
                  </div>
                  <!-- //헤더 메뉴 -->
                  <div class="header-tit">
                    <h2>Covid Risk Factor Guide</h2>
                  </div>
                </div>
              </div>
            </div><!--header-->
            <!-- <div id="nav">nav</div>
        <div id="side">side</div> -->
            <div id="contents">
              <form method="post" action="/topic/submit">
                <div class="container">
                  <div class="row">
                    <div class="col-6 col-sm-4">
                      <br/>
                      <div class="card" style="width: 18rem;">
                        <div class="card-header">
                        Risk Factor
                        </div>
                        <ul class="list-group list-group-flush">
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="Cancer" />
                          Cancer</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="Cerebrovascular disease" />
                            Cerebrovascular disease</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="COPD (chronic obstructive pulmonary disease)" />
                            COPD (chronic obstructive pulmonary disease)</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="Chronic kidney disease" />
                            Chronic kidney disease</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="Diabetes mellitus, type 1 and type 2" />
                            Diabetes mellitus, type 1 and type 2</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor"
                            value="Heart conditions (such as heart failure, coronary artery disease, or cardiomyopathies)" />
                            Heart conditions (such as heart failure, coronary artery disease, or cardiomyopathies)</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor"
                            value="Obesity (BMI ≥30 kg/m2)" />
                            Obesity (BMI ≥30 kg/m2)</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="Pregnancy" />
                            Pregnancy</li>
                          <li class="list-group-item"><input type="checkbox" name="RiskFactor" value="Smoking, current and former" />
                            Smoking, current and former</li>
                        </ul>
                      </div>
                    </div>
                    <div class="col-6 col-sm-4">
                      <br/>
                      <h3>Your Own Risk Factor</h3>
                        <!-- <input type="text" name="RiskFactor" placeholder="Search.." />
                        <input type="submit" value="Discover" />
                        <button type="submit" class="btn btn-primary">Discover</button> -->
        
                          <input type="text" name="RiskFactor" class="form-control" placeholder="Enter Query or Risk Factor">
                          <button type="submit" class="btn btn-primary mb-3">Discover</button>
        
                        <!-- <div class="col-auto">
                          <input type="text" name="RiskFactor" class="form-control" placeholder="Enter Query or Risk Factor">
                        </div>
                        <br/>
                        <div class="col-auto">
                          <button type="submit" class="btn btn-primary mb-3">Discover</button>
                        </div> -->
                      <!-- <p>
                        <br/>
                        <input type="submit" value="Discover" display:inline/>
                        <input type="reset" value="Reset" />
                      </p> -->
                    </div>
                
                    <!-- Force next columns to break to new line at md breakpoint and up -->
                    <div class="w-100 d-none d-md-block"></div>
                    <br/>
                    <div class="col-6 col-sm-4"></div>
                    <div class="col-6 col-sm-4"></div>
                  </div>
                </div>
              </form>
        
              <div class="container">
                <div class="row">
                </div>
                <div class="row">
                  ${body} ${control}
                </div>
              </div>
            </div> <!-- /contents -->
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

