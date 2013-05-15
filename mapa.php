<?php
	//Ens conectem a la base de dades
	$username="root";
	$password="";
	$database="platges";

	mysql_connect("localhost",$username,$password);
	@mysql_select_db($database) or die( "Unable to select database");
	
	//Seleccionem tots els registres de la taula entitats
	$query="SELECT * FROM platges order by nomPlatja";
	$result=mysql_query($query);
	
	$num=mysql_numrows($result);
	
	
	//Tanquem la connexió
	mysql_close();
?>
<html>
	<head>
		<!--cridem els scripts necessaris-->
		<script src="scripts/OpenLayers-2.11/lib/OpenLayers.js"></script>
		<script type="text/javascript" src="scripts/ArcGISCache.js" ></script>
		<script src="scripts/map.js"  type="text/javascript"></script>
		<script src="scripts/animatedcluster.js"  type="text/javascript"></script>
		<script type="text/javascript"> 
			
			
		function marcadors_on()
			{
				<?php
				$i=0;
				//Recorrem la matriu de resultats
				while ($i < $num) {
					//Assignem els valors de cada camp de cada registre a una variable
					$idPlatja = mysql_result($result,$i,"idPlatja");
					$nomPlatja = str_replace("'","\'",mysql_result($result,$i,"nomPlatja"));
					$tipusPlatja = mysql_result($result,$i,"tipusPlatja");
					$urlFitxaAmbiental = mysql_result($result,$i,"urlFitxaAmbiental");
					$urlFitxaResum = mysql_result($result,$i,"urlFitxaResum");
					$Lon = mysql_result($result,$i,"X");
					$Lat = mysql_result($result,$i,"Y");					
				//cridem la funció posaFeature amb les variables que hem creat
					echo "posaFeature($Lon,$Lat,$idPlatja,'$nomPlatja','$tipusPlatja');";
					$i++;
				}	
			
				?>
			
			}
		</script>
	</head>
	<!--quan es carregui el body cridarà la funció init (crea el mapa)-->
	<body onload="init()">
		<div id="mapa" style="width:100%; height: 100%"></div>
		
	</body>



</html>