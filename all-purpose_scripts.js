//all-purpose_scripts.js

// Generic functions library


function load_results() // encodes search terms for transmission via URL to 'kb_sorted_search_results'
{
	var term=window.location;
	term=document.query.keyword.value; // document.form_name.input_name.value
	if (term!=null) // allow empty string (i.e., user pressed return key w/o entering a value)...
	{
		console.log(term);
		term = encodeURIComponent(term);
		window.location.href = "kb_sorted_search_results.html?" + term;
	}
}


function decodeSearchTerms(){
	// decodes search terms passed via URL
	var terms = decodeURIComponent(window.location.search);
	if (terms.substring(0, 1) == '?') //strip '?' and change case
	{
		terms = terms.substring(1);
		terms = terms.toLowerCase();
	}
	return terms;
}

// 3 versions of the loadXMLDoc function. Version 2 is currently used

function loadXMLDoc(myXMLfile)
{
	if (navigator.appName=="Microsoft Internet Explorer")
		{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.load(myXMLfile);
		return xmlDoc;
		}
	else if (document.implementation.createDocument)
		{// code for Mozilla, Firefox, Opera, etc.
		xhttp = new XMLHttpRequest();
		xhttp.open("GET",myXMLfile,false);
		xhttp.send();
		return xhttp.responseXML;
		}
	else
		{ // crap out
			alert('Your browser cannot handle this script');
		}// end of if/elseif/else
}

function loadXMLDoc2(myXMLfile) // returns handle to XML file for DOM manipulation
{
	if (window.XMLHttpRequest)
		{// code for Mozilla, Firefox, Opera, etc.
		xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET",myXMLfile,false); // sychronous call to simplify code
		xmlhttp.send();
		return xmlhttp.responseXML;
		}
	else if (navigator.appName=="Microsoft Internet Explorer")
		{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.load(myXMLfile);
		return xmlDoc;
	}
	else
		{ // crap out
			alert('Your browser cannot handle this script');
		}// end of if/elseif/else
}

function loadXMLDoc3(myXMLfile) // DOESN'T WORK!!!! returns handle to XML file for DOM manipulation
{
	if (window.XMLHttpRequest)
	{// code for Mozilla, Firefox, Opera, etc.

		xmlhttp = new XMLHttpRequest();

		xmlDocument = xmlhttp.onreadystatechange=function()
		{
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
			{
				var bob = xmlhttp.responseXML;
				return bob;
			}
		}

		xmlhttp.open("GET",myXMLfile,true); // asychronous call
		xmlhttp.send();

		return xmlDocument.documentElement;
	}

	else

	{ // crap out
		alert('Your browser cannot handle this script');
	}// end of if/elseif/else
}
// =========== SORTING =============

function dynamicSortVersion1(property) {
	return function (a,b) {
		if (a[property].toLowerCase( ) < b[property].toLowerCase( )) return -1;
		if (a[property].toLowerCase( ) > b[property].toLowerCase( )) return 1;
		return 0;
	}
}



/*
	Function simply()
		Performs a simple sort of an array containing strings
*/

function simply(a,b) // sorts array of simple strings
{
	if (a.toLowerCase( ) < b.toLowerCase( )) return -1;
	if (a.toLowerCase( ) > b.toLowerCase( )) return 1;
	return 0;
}


// =========== FUNCTIONS NOT UTILIZED BY STEVE'S KB =============



function mouseClick(x) // demo function for mouse-click listening. Should use it to run code; let css handle style!
{
	x.style.color="red";
	x.style.fontWeight = 'normal';
}

