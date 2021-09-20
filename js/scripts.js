

//Chave conta 1- lkvMIcOtW6UqQ2A9UeIc2cWD1TaxnRZv
//Chave conta 2 - D6cfQL07NolmyqDyHj4g6fDSJfYaID3g
//chave conta vinicius - ut2cs3PdmynEZpHAwq3KeJX2DTOd3h64

var api_key = 'lkvMIcOtW6UqQ2A9UeIc2cWD1TaxnRZv'

var cidade
    $('#search-button').click(function(){
        $('.refresh-loader').show()
        if (!$('#local').val()){
            return
        }
        cidade = $('#local').val()
        pegar_cidade(pegar_coordenada)
     })

     $(document).keypress(function(e) {
        if(e.which == 13) {
            if (!$('#local').val()){
                return
            }
        $('.refresh-loader').show()
        cidade = $('#local').val()
         pegar_cidade(pegar_coordenada)
        }
    });



var horarios = []
var variacao_temperatura = []
    function pegar_previsao_12horas(key){
        $.ajax({
            url : "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/"+ key +"?apikey=" +api_key+ "&language=pt-br&details=true&metric=true",
            type: "GET",
            dataType: "json"
        }).done(function(data){
            gerar_grafico(data)
            $('.refresh-loader').fadeOut()
           
            
        }).fail(function(){
            console.log("Erro na requisição");
            $('.refresh-loader').fadeOut()
        });
    }


    function gerar_grafico(dados){
        variacao_temperatura = []
        horarios = []
        for (x=0; x < dados.length; x++){
            var hora = new Date(dados[x].DateTime)
            var horario_formatado = hora.getHours() + 'h'
            horarios.push(horario_formatado)
            variacao_temperatura.push(dados[x].Temperature.Value)
        }
        console.log(horarios[0])

    try{
    Highcharts.chart('container', {
        chart:{
            type:'line'
        },

        title: {
            text: 'Variação de temperatura nas próximas 12 horas'
        },
        xAxis: {
            categories: horarios
        },
        yAxis: {
            title: {
                text: 'Temperatura ºC'
            }
        },
        plotOptions: {
            showInLegend : false,
            line:{
                dataLabels:{
                    enabled:true
                },
                enableMouseTracking : false
            }
        },
    
        series: [{
            showInLegend : false,
            data:variacao_temperatura
        }]
    
    })
    }catch{
        alert('Erro ao gerar o gráfico, tente mais tarde')
    }
}


    function pegar_IP(callback){
        $.ajax({
            url : "http://www.geoplugin.net/json.gp?",
            type: "GET",
            dataType: "json"
        }).done(function(data){
            $('#texto_local').text(data.geoplugin_city + ', ' + data.geoplugin_region + ', ' + data.geoplugin_countryCode )
            var latitude = data.geoplugin_latitude
            var longitude = data.geoplugin_longitude
            var coordenadas_atual = latitude +'%2C' +longitude
            callback(coordenadas_atual)
        }).fail(function(){
            console.log("Erro na requisição");
            $('.refresh-loader').fadeOut()
        });
    }


    function pegar_cidade(callback){

        $.ajax({
                    url : "https://api.mapbox.com/geocoding/v5/mapbox.places/"+ encodeURI(cidade) + ".json?access_token=pk.eyJ1IjoiYnJ1bm9zdGVsIiwiYSI6ImNrdGYwb3FnZzAzb2UycHBoeWR5NGJmMHgifQ.gNI6T3gCgF--dpRcyWBJcw",
                    type: "GET",
                    dataType: "json"
                }).done(function(data){
                    callback(data)
                }).fail(function(){
                    console.log("Erro na requisição");
                    $('.refresh-loader').fadeOut()
                    alert('Digite uma cidade e estado válidos')
                });

    
        }
     
        function pegar_coordenada(data){
        try{
            var latitude = data.features[0].center[1]
           var longitude= data.features[0].center[0]
           coordenadas = (latitude + '%2C' + longitude)
           $('#texto_local').text(data.features[0].place_name)
           pegar_ID_cidade(coordenadas)
            }catch{
                $('.refresh-loader').fadeOut()
                alert('Digite uma cidade e estado válidos')
            }
        }

    function pegar_ID_cidade(coordenadas_atual){
        $.ajax({
            url : "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" +api_key+ "&q=" +coordenadas_atual+ "&language=pt-BR",
            type: "GET",
            dataType: "json"
        }).done(function(data){
            pegar_previsao_5dias(data.Key)
            pegar_previsao_atual(data.Key)
            pegar_previsao_diaria(data.Key)
            pegar_previsao_12horas(data.Key)
           
        }).fail(function(){
            console.log("Erro na requisição");
            $('.refresh-loader').fadeOut()
        });
    }


        function pegar_previsao_5dias(key){
        $.ajax({
            url : "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + key + "?apikey=" +api_key+ "&language=pt-BR&details=true&metric=true",
            type: "GET",
            dataType: "json"
        }).done(function(data){
            popular_previsao_5dias(data)
        
        }).fail(function(){
            console.log("Erro na requisição");
            $('.refresh-loader').fadeOut()
        });
    }


    var semana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

        function popular_previsao_5dias(data){

            for(x=0; x<data.DailyForecasts.length; x++){
                if(data.DailyForecasts[x].Day.Icon < 10){
                    data.DailyForecasts[x].Day.Icon = '0' + data.DailyForecasts[x].Day.Icon
                }
            
                //Alterando o icone do dia
                y = 'dia' + x + '_imagem'
                $('#'+y).css("background-image", "url(https://developer.accuweather.com/sites/default/files/" + data.DailyForecasts[x].Day.Icon + "-s.png)");
                
                //Alterando o nome do dia
                var dia = new Date(data.DailyForecasts[x].Date)
                y = 'dia' + x + '_texto'
                $('#'+y).text(semana[dia.getDay()])

                //Alterando a temperatura
                y = 'dia' + x + '_temp'
                $('#'+y).text(data.DailyForecasts[x].Temperature.Minimum.Value.toFixed(0) + 'ºC/' +data.DailyForecasts[x].Temperature.Maximum.Value.toFixed(0) + 'ºC' ) 
            
            }
         }
         
            function pegar_previsao_atual(key){
        $.ajax({
            url : "http://dataservice.accuweather.com/currentconditions/v1/" + key + "?apikey=" +api_key+ "&language=pt-br&details=true",
            type: "GET",
            dataType: "json"
        }).done(function(data){
            console.log(data)
            popular_previsao_atual(data)
        }).fail(function(){
            console.log("Erro na requisição");
            $('.refresh-loader').fadeOut()
        });
    }

        function popular_previsao_atual(data){
            $('#texto_temperatura').text(data[0].Temperature.Metric.Value.toFixed(0) + 'ºC')
            var icone = data[0].WeatherIcon
            console.log(data)
            console.log('teste')
            if(icone < 10 ){
                icone = '0' + icone
            }
            $("#icone_clima").css("background-image", "url(https://developer.accuweather.com/sites/default/files/" + icone + "-s.png)");
            $("#texto_clima").text(data[0].WeatherText)
        }

         function pegar_previsao_diaria(key){
        $.ajax({
            url : "http://dataservice.accuweather.com/forecasts/v1/daily/1day/"+key+"?apikey=" +api_key+ "&language=pt-br&details=true&metric=true",
            type: "GET",
            dataType: "json"
        }).done(function(data){
            console.log(data)
           
            popular_previsao_diaria(data)
        }).fail(function(){
            console.log("Erro na requisição");
            $('.refresh-loader').fadeOut()
        });
        }

        function popular_previsao_diaria(data){
            $("#texto_max_min").text(data.DailyForecasts[0].Temperature.Minimum.Value.toFixed(0) + 'ºC/' + 
            data.DailyForecasts[0].Temperature.Maximum.Value.toFixed(0) + 'ºC')
        }

        
    pegar_IP(pegar_ID_cidade)


      

       
