


vecLstConsultas = [];   //variable global para manejar listas de consultas



function init(){
                document.addEventListener("deviceready", onDeviceReady, false);
                jQuery.support.cors = true;
                $.mobile.allowCrossDomainPages = true;  
            
                
}
function onDeviceReady(){	
	
	$("#btnEliminar").parent().show();	
	$("#btnAgregar").parent().show();
	$("#regNum").hide();
	
	//creo DB y las tablas
	
	db = window.openDatabase("TourDB", "1.0", "TourGap Database", 1000000);	
	CrearTablas(); 
	
	//lleno desplegables
	
	LoadDep();
	LoadCat();	
	
	//asigno funcionalidad a botones
	
	$("#btnAgregar").on("vclick",function(){			
		setOp();	
	});
	
	$(".favBar").on("vclick", function(){
		getOperadores();
		
	});
	$("#btnConsulta").on("vclick", function(){
		
		getConsulta();		
						
	});	
	$("#btnEliminar").on("vclick", function(){
		eliminarOp();	
							
	});	
	$("#btnOk").on("vclick", function(){
		$("#dlgAlert").dialog('close');								
	});	
	$(function() {
		setTimeout(hideSplash, 5000);
	});
	
	
}


//Relleno combobox de departamentos

function LoadDep(){		
	var aux = "";
	$("#departamento").empty();	
	$.getJSON("http://turismo.gub.uy/operadores/json.php?lista=deptos",{format: "json"}
	,function(data,textStatus, xhr ){
		if(xhr.status == 500 || xhr.status == 404 || xhr.status == 503) 
		{
			showMsg("El servicio no se encuentra disponible moment\u00e1neamente. Int\u00e9ntelo nuevamente mas tarde.");
		}
		else 
		{
			$.each(data, function(indice, entrada)
					{
						aux = "<option value='" + entrada.id +"'>"+entrada.name+"</option>";		
						$("#departamento").append(aux);						
					});				
			$("#departamento").selectmenu('refresh');		
		}
		});		
}
	


//Relleno combobox de categorias


function LoadCat(){		
	var aux2 = "";
	$("#categoria").empty();	
	$.getJSON("http://turismo.gub.uy/operadores/json.php?lista=operadores",{format: "json"}
	,function(data,textStatus, xhr){	
		if(xhr.status == 500 || xhr.status == 404 || xhr.status == 503) 
		{
			showMsg("El servicio no se encuentra disponible moment\u00e1neamente. Int\u00e9ntelo nuevamente mas tarde.");
		}
		else 		
		{
			$.each(data, function(indice, entrada) 
					{
						aux2 = "<option value='" + entrada.id +"'>"+entrada.name+"</option>";		
						$("#categoria").append(aux2);					
					});		
			$("#categoria").selectmenu('refresh');
		}									
	});	
}

//proceso y efectuo consulta json y cargo la lista de operadores y la muestro

function getConsulta(){		
	$.mobile.showPageLoadingMsg();
	var catSelected = $("#categoria").val();
	var depSelected = $("#departamento").val();	
	var nombre = $("#nombre").val().replace(" ","_");
	var vecConsulta = {};

	vecLstConsultas.length = 0;		
	//alert (catSelected +" "+ depSelected + "  " +nombre);

	var urlConsulta = "http://turismo.gub.uy/operadores/json.php?tipo=" + catSelected + 
	"&departamento="+ depSelected +
	"&texto="+nombre;

	$.getJSON(urlConsulta,{format: "json"}
	,function(data, textStatus, xhr){
		if(xhr.status == 500 || xhr.status == 404 || xhr.status == 503) 
		{
			showMsg("El servicio no se encuentra disponible moment\u00e1neamente. Int\u00e9ntelo nuevamente mas tarde.");
		}
		else {
			$.each(data, function(indice, entrada){                     //uso idoperador para crear las listas con id unica
				vecConsulta = {"idOperador":indice,
						"registrationNumber":entrada.registrationNumber,
						"fantasyName":entrada.fantasyName,
						//"mainBranch":entrada.mainBranch,
						"street":entrada.street,
						//"town":entrada.town,
						//"department":entrada.department,
						"phone1":entrada.phone1,
						//"cellPhone":entrada.cellPhone,
						"email":entrada.email,
						//"latitude":entrada.latitude,
						//"longitude":entrada.longitude,
						"webSite1":entrada.webSite1};
				vecLstConsultas[vecLstConsultas.length] = vecConsulta; 
			});
			if(vecLstConsultas.length == 0)
			{							
				showMsg('La consulta no ha devuelto datos');			
			}
			else
			{
				getListView();		
				$.mobile.changePage("#consultas");	
				$("#lstConsulta").listview('refresh');	
			 	$.mobile.hidePageLoadingMsg();
			}				
		}									
	});
}
		
//funcion para mostrar lista de operadores, consulta o favoritos

function getListView(){	
	$("#lstConsulta").empty();
	var htmlData = "";		
	for(var i=0; i < vecLstConsultas.length; i++)       //creo cada li usando reg number
		{
			htmlData = "<li class='licons' id='"+						
						vecLstConsultas[i].idOperador +"'>"+
						"<a href='#infoOp"+"'>"+					
						vecLstConsultas[i].fantasyName +
						"</a></li>";				
			$("#lstConsulta").append(htmlData);	
		}
	
	$('.licons').each(function(event){							//añado funcionalidad a cada boton li
		var elementId = $(this).attr("id");
		elementId = "#" + elementId;
			$(function(){		
				$(elementId).on('vclick', function(event){			
					
						showInfoOp($(this).attr("id"));									
				
				});		
			});		
	});	

}

//muestra los datos de un determinado operador

function showInfoOp(idOp){
	var encontrado = false;
	var i=0;
	
	while( i<vecLstConsultas.length && !encontrado)
		{
			if(idOp == vecLstConsultas[i].idOperador)
				{					
					encontrado = true;
				}	
			else
				{
					i++;
				} 
		}
		if(encontrado)
		{				
			$('#regNum').html(vecLstConsultas[i].registrationNumber);
			$('#nombreop').html(vecLstConsultas[i].fantasyName);
			$('#direccion').html(vecLstConsultas[i].street);
			$('#telefono').html(vecLstConsultas[i].phone1);
			$('#email').html(vecLstConsultas[i].email);
			$('#sweb').html(vecLstConsultas[i].webSite1);	
			
			esFavorito(vecLstConsultas[i].registrationNumber, vecLstConsultas[i].street);		
		}

}


//ingresa un operador en la BD

function setOp(){

	var regnum = $('#regNum').html();
 	var nombre = $('#nombreop').html();
	var dir =	$('#direccion').html();
	var tel	= $('#telefono').html();
	var email =	$('#email').html();
	var sweb = $('#sweb').html();
    
    		   db.transaction(function(tx){    			   
    			   var sql = 'INSERT INTO Operadores (regnum, nombreop, direccion, telefono, email, sweb) VALUES ("'+regnum+'","'+nombre+'","'+dir+'","'+tel+'","'+email+'","'+sweb+'")';
    			   tx.executeSql(sql);    				   
    		   }, function errorCB(err){
    			   
    			   showMsg("No se pudo ingresar el operador, error: "+err);   			   
    			   					 
    			   
    		   }, function successCB(){    			 
    			   $("#btnEliminar").parent().show();
				   $("#btnAgregar").parent().hide();
				   showMsg("Operador ingresado con \u00e9xito");		                         
    		   });      		 
}

//Genera las tablas en la BD

function CrearTablas(){
	db.transaction(function(tx){		
		tx.executeSql('CREATE TABLE IF NOT EXISTS Operadores (regnum , nombreop, direccion PRIMARY KEY, telefono, email, sweb )');
		//tx.executeSql('DROP TABLE  Operadores');
	}, function errorCB(err){
		showMsg("Error al crear tablas, error: "+err);	   
	 
    },  function successCB(){
		//location.reload();
	   //alert("Tablas creadas correctamente");
	});
}      
	       
	
//Obtiene la lista total de operadores favoritos de la BD y las guardo en memoria y muestro

function getOperadores(){
	
	vecLstConsultas.length = 0;	
	var vecConsulta = {};
			db.transaction(function (tx){				
                 tx.executeSql('SELECT * FROM Operadores', [], function(tx, results){
                           var item=""; 
                           		for(var index=0;index<results.rows.length;index++)
                           		{
                           			item = results.rows.item(index);
                        	   
                           			vecConsulta = {"idOperador":index,
                           					"registrationNumber":item.regnum,
    										"fantasyName":item.nombreop,
    										//"mainBranch":entrada.mainBranch,
    										"street":item.direccion,
    										//"town":entrada.town,
    										//"department":entrada.department,
    										"phone1":item.telefono,
    										//"cellPhone":entrada.cellPhone,
    										"email":item.email,
    										//"latitude":entrada.latitude,
    										//"longitude":entrada.longitude,
    										"webSite1":item.sweb};
                           			vecLstConsultas[vecLstConsultas.length] = vecConsulta;                        			
                           		} ;                       		
                           		
                            },	//error de executeSql
                            function(err){
                            	showMsg("Error al procesar DB, error:"+ err.message);                                    
                            });                                                                                              
                            },                         //errores de tx
                            //error callback
                            function (err){
                            	showMsg("Error al procesar en la transacci\u00f3n, error"+err.code+" "+err.message);                         
                           
                            },
                            //success callback
                            function (){                            	
                        	 	$('#nombreop').html("");
                        		$('#direccion').html("");
                        		$('#telefono').html("");
                        		$('#email').html("");
                        		$('#sweb').html("");   
                        		getListView();
                        		$("#lstConsulta").listview('refresh');
                 }); 		  
     
}


//Elimino un determinado operador de la lsita de favoritos

function eliminarOp(){
		var regnumber = $("#regNum").html();
		var street = $("#direccion").html();
		db.transaction(function (tx){		
			tx.executeSql('DELETE FROM Operadores WHERE regnum="'+regnumber+'" AND direccion="'+street+'"');
		}, function errorCB(err){	
			showMsg("No se ha podido eliminar el operador: "+err);
			
		}, function successCB(){
			showMsg("Operador eliminado con \u00e9xito");		
			$("#btnEliminar").parent().hide();
			$("#btnAgregar").parent().show();
		});			
}


//comprueba si el operador se encuentra ingresado en la base de datos de favoritos y oculta los botones

function esFavorito(regnum, street){
	
		db.transaction(function (tx){
		tx.executeSql('SELECT * FROM Operadores WHERE regnum="'+regnum+'" AND direccion="'+street+'"', [], function(tx, results){
			var item = results.rows.length;
			if(item != 0)
				{
					$("#btnEliminar").parent().show();
					$("#btnAgregar").parent().hide();
				}
			else
				{
					$("#btnEliminar").parent().hide();
					$("#btnAgregar").parent().show();
				}
			
		}, function(err){			
			showMsg("Error en consulta:"+err);
            
        });   
		
	
		}, function errorCB(err){		
			showMsg("Error en transacci\u00f3n:"+err);
		
		}, function successCB(){
								
	});			
}
function showMsg(msg){	
	
	$("#txtAlert").html("<h3>"+msg+"</h3>");
	$.mobile.changePage('#dlgAlert', 'slidedown', false, true);	
}
function hideSplash() {
	  $.mobile.changePage("#inicio", "fade");
	}



