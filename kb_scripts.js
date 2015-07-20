/*	

	kb_scripts.js
	
	Updated: 10/6/2013
	
	Code to update when adding/subtracting XML fields to table

	function addRowsTo(myRows): (must correspond to order of fields in XML schema!
	⁃	var new_field=currentEntry.getElementsByTagName("new_field")[0].childNodes[0].nodeValue;
	⁃	combinedTxt = " " + topic + " " + notes  + " " + new_field + " " + date_added + " " + category + " " + keywords + " " + url;
	⁃	newRow += "<td class=\"new_field\">"+ new_field +"</td>";
	
	function outputAsTable(rowsArray)
	⁃	fieldlist = fieldlist + '<th onclick=\'ripRows("new_field")\'> New Field </th>';

*/

//========= MAIN FUNCTION =========
	// Reads in data from XML file
	// Uses table functions to build results table
	// Adds descriptive blurb to top of results form 
	// 	(e.g., "Your search for 'computer' retrieved 5 items")
	// Writes (outputs) table to resuts form

function main() {

	<!-- var KB_FILE = 'demo_knowledgebase.xml'; -->
	var KB_FILE = 'knowledgebase.xml';
	
	// retrieve/decode terms passed from search form
	searchTerms = decodeSearchTerms(); // global used by filtering functions and saved to hidden div
	
	// read in XML data
	xmlDoc=loadXMLDoc2(KB_FILE);
	
	if (xmlDoc!=null) 
	{
		//  (1.) Assemble array for Rows for the Table ==
		var rowsArray = new Array(); // Create an empty array to store selected rows
		var rowCount = addRowsTo(rowsArray); // add rows that meet the search criteria to table array and return total number
		
		//  (2.) Reverse sort the Rows by 'date added' 'desc' as default sort
		sortkey = 'date_added';
		sorttype = 'desc';
		rowsArray.sort(byTag(sortkey, sorttype));
		
		// (3.) Add boilerplate to top of results screen
		boilerplate(rowCount); // display count of results returned
		
		// (4.) Save info in hidden div
		setSortInfo( 'oldkeyfield', sortkey);
		setSortInfo( 'oldsorttype', sorttype);
		setSortInfo( 'rowcount',  rowCount);

		//  (5.) Write selected Rows (from rowsArray) to screen as an HTML table ==
		outputAsTable(rowsArray);
		
		// TO DO: (6.) Set focus to new search text box
		
	}// end if (xmlDoc!=null)
}// end main()

function boilerplate(rCount){
	var resultsBlurb = document.getElementById("resultsBlurbDiv"); 

	// quick & dirty display of search results text: assemble text from 2 chunks
	var theText = "<h3 class='center'>Your search for '"+searchTerms+"' retrieved " + rCount + " items</h3>"; // rCount not yet defined
	
	/*
	// Old Back Button
	resultsBlurb.innerHTML += '<h3 class="center"><a href="kb_search_form.html"><em>BACK</em></a></h3>';
	*/
	
	// New search box
 	theText += '<form class="center" name="query" onSubmit="load_results(); return false;">';
 	theText += 'New Search: <input type="text" name="keyword" /><input type="button" onClick="load_results()" value="Submit" /></form><br />';
	resultsBlurb.innerHTML = theText;

}

// ===== TABLE FUNCTIONS =====
{
	// Using data from XML file, build a string array of table's data rows. Header row handled elsewhere
	// Assemble array of strings 'myRows[]' containing row data as HTML (read in from XML)  (html table cells minus <tr> endpoints)
	
	function addRowsTo(myRows){
		// assumes myRows is empty!
		var combinedTxt = "";
		var newRow = "";
		var entry=xmlDoc.getElementsByTagName("entry");// loop thru ENTRYs
		
		for (var i=0;i<entry.length;i++) // FOR EACH ENTRY grab all fields (of interest)
		{  
			// (1) USE XML DOM to extract a data record (entry) from XML
			var currentEntry = entry[i]; // reduce overhead of repeated DOM calls for entry[i]
			var topic=currentEntry.getElementsByTagName("topic")[0].childNodes[0].nodeValue; 			
			
			// Skip current & subsequent entries if topic (and presumably rest of entry) is empty (i.e., " ").
			if(topic == " ") break;  // Alternatively, we could continue to examine all entries....
			
			var notes=currentEntry.getElementsByTagName("notes")[0].childNodes[0].nodeValue;
			var date_added=currentEntry.getElementsByTagName("date_added")[0].childNodes[0].nodeValue;
			var category=currentEntry.getElementsByTagName("category")[0].childNodes[0].nodeValue;
			var keywords=currentEntry.getElementsByTagName("keywords")[0].childNodes[0].nodeValue;
			var url=currentEntry.getElementsByTagName("url")[0].childNodes[0].nodeValue;
			
			// let's mash-up all the text fields into one string for quick multi-field searching:
			combinedTxt = " " + topic + " " + notes  + " " + date_added + " " + category + " " +  keywords + " " + url;
			
			// (2) Check search terms against combined text from current entry
			if( hasAllRequiredTerms(combinedTxt) === true &&
				hasAnyProscribedTerms(combinedTxt) === false &&
				 hasAnyOptionalTerms(combinedTxt) === true )
			{	
				// (3) Build new row as a line of HTML table cells  (<td>...</td>)'s and append to end of array myRows using size of array as index for new element. IN ORDER TO BE ABLE TO SORT THE TABLE before initial output, we'll add row#s and table-row HTML tags when outputing table instead.
				
				newRow = "<td class=\"topic\">"+topic+"</td>"; // newRow is string var
				newRow += "<td class=\"notes\">"+notes+"</td>"; // handle special white-space formatting in CSS
				newRow += "<td class=\"date_added\">"+date_added+"</td>";
				newRow += "<td class=\"category\">"+category+"</td>";
				newRow += "<td class=\"keywords\">"+keywords+"</td>";
				newRow += "<td class=\"url\"><a href=\""+url+"\">"+url+"</a></td>";						
				myRows[myRows.length] = newRow; // append new row to end of array (slick trick #5)
			}// end if has searchTerms
			
		} // end for i loop ( = next entry)
		
		return myRows.length;

	} // end addRowsTo()	
	

	function outputAsTable(rowsArray) // POTENTIAL NAMESPACE CONFLICT WITH CALLING FUNCTION!!! LOOK INTO
	{
		// Output table array
		// Writes table to screen
		
		// Adds header row to table on the fly
		// Adds row tags and row# field to each data row on the fly:
		//	(e.g., "<tr><td>row#</td>field1</td><td>field2<?td><td>...</td></tr>")
		
		theTable=document.getElementById("kb_table"); // theTable points to table
		
		//add header row to table if doesn't already exist
		if (!theTable.tHead){
			var myheader=theTable.createTHead();
			var row=myheader.insertRow(0);
			var fieldlist ='<tr><th>Row</th>';
			fieldlist = fieldlist + '<th onclick=\'ripRows("topic")\'>Topic</th>';
			fieldlist = fieldlist + '<th onclick=\'ripRows("notes")\'>Notes</th>';
			fieldlist = fieldlist + '<th onclick=\'ripRows("date_added")\'>Date Added</th>';
			fieldlist = fieldlist + '<th onclick=\'ripRows("category")\'>Category</th>';
			fieldlist = fieldlist + '<th onclick=\'ripRows("keywords")\'>Keywords</th>';
			fieldlist = fieldlist + '<th onclick=\'ripRows("url")\'>URL</th>';
			row.innerHTML = fieldlist;
		} // end if !tableH.tHead
		
		// TO DO:  update appropriate column heading with 'A-Z' or 'Z-A' (i.e., some version of 'theTable.rows[0].cells[x].innerHTML')
		
		// Build table body
		// Append content rows to tBodies (table body object) overwriting any existing rows
	 	
	 	var rowCount = rowsArray.length; // for iteration
	 	var bob = "";
		for(j=0; j<rowCount; j++)
		{
			bob += "<tr><td>" + ( j + 1) + "</td>"+ rowsArray[j] + "</tr>";
		} // end for j
		theTable.tBodies[0].innerHTML = bob;	
	} // end outputAsTable()
}

// ===== FILTERING FUNCTIONS =====

// code block for easy collapse in TextWrangler
{
	function hasAllRequiredTerms(theText) // checks searchTerms for presence of _all_ terms in combined text of current entry. Returns T/F.
	// Assumes each term begins with '+'. Returns TRUE if no '+' terms passed to function
	//	pattern = /\B\+[^" ]+/gi (when defining pattern this way, don't add quotes like with a string!)
	{
		found = true;
		if(searchWords = searchTerms.match(/\B\+([^" ]+)/gi)) // extract plus-searchWords "+searchWords" (\B = subtly played)
		{
			for(a=0;a<searchWords.length;a++)
			{
				if(theText.toLowerCase().search(searchWords[a].slice(1))<0) // if term not in entry...fail test
				{
					found = false;
					break; // exit loop
				} // end if
			} // end for
		}// end if
		
		//now do it for phrases if we haven't failed with words
		if( found === true)
		{
			if(searchPhrases = searchTerms.match(/\+"[^"]+"/gi)) // if there are any search phrases  (i.e., +"...") present in searchTerms, extract them into array 'searchPhrases')
			{
				for(x=0;x<searchPhrases.length;x++)
				{
				//*******************************************
				// handling leading or trailing q-marks in each phrase searchPhrases[x]:
				// 	- could use searchTerms.match(/\+"[^"]+(?=")/gi) to auto slice last q-mark (w/ fancy look-ahead!), OR
				// 	- could handle w/ searchPhrases[x].substr(2,searchPhrases[x].length-3) in search below (...\"")
				//*******************************************
					if(theText.toLowerCase().search(searchPhrases[x].substr(2,searchPhrases[x].length-3))<0) // if current phrase not in entry then fail test, and function returns 'false'
					{
						found = false;
						break; // exit for loop and if 
					} // end if
				} // end for
			}// end if
		}// end if found === true
		
		return found; 
	} // end function
	
	function hasAnyProscribedTerms(theText) // checks searchTerms for presence of _any_ term in combined text of current entry. Returns T/F. Assumes each term begins with '-'. Returns FALSE if no '-' terms in searchTerms
	{
		found = false;
		if(searchWords = searchTerms.match(/\-(\b[^ ]+\b)/gi)) // extract minus-words "-words"
		{
			for(c=0;c<searchWords.length;c++)
			{
				if(theText.toLowerCase().search(searchWords[c].slice(1))>=0) // if term found in entry...fail test
				{
					found = true;
					break; // exit loop
				} // end if
			} // end for
		} // end if
		
		//now do it for phrases if we haven't failed with words
		if( found === false)
		{
			if(searchPhrases = searchTerms.match(/\-"[^"]+"/gi)) // extract minus-phrases "-phrase"
			{
				for(y=0;y<searchPhrases.length;y++)
				{
					if(theText.toLowerCase().search(searchPhrases[y].substr(2,searchPhrases[y].length-3))>=0) // if current phrase not in entry then fail test, and function returns 'false'
					{
						found = true;
						break; // exit loop
					} // end if
				} // end for
			} // end if
		}// end if found === true
		
		return found;
	} // end function
	
	function hasAnyOptionalTerms(theText) // checks searchTerms for presence of _at least one_ term (including mandatory) in combined text of current entry. Returns TRUE if any term found
	{

		// NEEDS A SERIOUS RETHINK: HOW TO COLLECT ALL NON-PROHIBITED SEARCH TERMS...
		// MAYBE CALL AFTER HASNAYPROSCRIBEDTERMS? IT IS CURRENTLY SO CONFIGURED...

		found = false;
		// searchWords_tmp = searchTerms.replace(/ ?[+-][^ ]+/g, ""); // capture non [+-] searchWords in one string
		searchWords_tmp = searchTerms.replace(/[\+\-]/g, ""); // strip mandatory prefixes from searchTerms and capture all words in searchWords in one string
		searchWords = searchWords_tmp.split(" "); // split terms into array words
		for(b=0;b<searchWords.length;b++)
		{ 
			if(theText.toLowerCase().search(searchWords[b])>=0) // if any term found in entry...pass test
			{
				found = true;
				break; // exit loop
			} // end if
		} // end for
		
		//now do it for phrases if we haven't failed with words
		// "cat" pulls up 29 records; "air" pulls up 8, some of which don't match. CHECK REGEX--IS PREPENDED " " causing trouble?
		if( found === false)
		{
			searchPhrases_tmp = searchTerms.replace(/ ?[+]"[^"]+"/g, ""); // capture non [+-] searchPhrases (and all words) in temp string
			searchPhrases = searchPhrases_tmp.match(/"[^"]+"/); // extract phrases in quotes into array searchPhrases
			if(searchPhrases != null)// why need only here??????? for this match expression ^?????
			{
				for(z=0;z<searchPhrases.length;z++)
				{
					if(theText.toLowerCase().search(searchPhrases[z].substr(2,searchPhrases[z].length-3))>=0) // if current phrase not in entry then fail test, and function returns 'false'
					{
						found = true;
						break; // exit loop
					} // end if
				} // end for
			}// end if searchPhrases = !null
		}// end if found === true
	
		return found;
	} // end function
}

//===== SORT FUNCTIONS =====
{
	// Thoughts: see javascripttester.html for tag-sort and column-sort functions
	//use tag-sort for array and column-sort for re-sorting an existing html table via HTMLdom


	/*
		Function byTag(tag) 
			Sorts array of table rows by column. Function matches tag against table cell's class, and sorts row by retrieved cell's content
			It's a fancy sort for several reasons:
			must wrap sorting function by 2nd function in order to pass _tag_ to sort function!
			Then we can sort array items (XML rows) by element within XML rows (namely, contents of <td>...</td>)
	*/

	function byTag(tag, direction) // HOW ABOUT SECONDARY SORT BY DATE?
	{
		if(direction == 'desc')
			{x=1;}
		else
			{x=-1;}
			
		//SPECIAL CASE: sorting dates
		// if( tag == 'date_added' || tag == 'category')
		if(tag.match("date")) // new version
		{
			return function(a, b) // date version
			{
				var date1 = new Date(getTagContent(a,tag));
				
				if(isNaN(date1.valueOf())){
					date1 = new Date("1/1/0001");
				}
				
				var date2 = new Date(getTagContent(b,tag));
				
				if(isNaN(date2.valueOf())){
					date2 = new Date("1/1/0001");
				}
				
				if(date1 < date2) return x;
				if(date1 > date2) return -x;
				return 0;
			}
		}
		else
		{
			return function(a, b) // regular version (handles text fields)
			{
				var line1 = getTagContent(a,tag);
				var line2 = getTagContent(b,tag);
				if(line1.toLowerCase() < line2.toLowerCase()) return x;
				if(line1.toLowerCase() > line2.toLowerCase()) return -x;
				return 0;
			}
		}
	}

	/*
		Function getTagContent( source, tag )
			Takes source string and tag name
			Returns contents of XML tag _tag_ as a string  
			(e.g., "computer" from <category>computer</category>)
	*/

	function getTagContent( source, tagName ) // What about using '[\s\S]*?' instead of '.*?' ?
	{
		// find all characters regardless between tag brackets: i.e., regex: .*? = match any (all) char except newline, less greedyily
		var myReg = new RegExp( "<td class=\"" + tagName + "\">(.*?)</td>");
		
		//strip line breaks from string for sort comparisson only (Kudos www.textfixer.com!)
		var str = source.replace(/(\r\n|\n|\r)/gm," ");
		
		var myArray = myReg.exec(str); // run regex
		
		try
		{
			if(myArray == null)
			{
				throw "error while attempting to getTagContent()\nTag name: " + tagName +
					 "\nsubmitted string: " + source;
			}
			return myArray[1]; // [0] = entire regex expression; [1] = text between tags
		}
		catch(err)
		{
			alert("Error description: " + err + "\n\n");
		}
	}
	
	function getSortInfo(id){
		return document.getElementById(id).innerHTML;
	}
	
	function setSortInfo( id, newText ){
		document.getElementById(id).innerHTML = newText;
	}

	
} // code bloc

// =====  REARRANGE & REDRAW TABLE FUNCTIONS ====
{
	function ripRows(newKeyField){
		tbl=document.getElementById("kb_table");
		Rows=tbl.tBodies[0].rows; // Get all rows of the table object (sans header!) 
		/*	
			Rows[0] contains column headings! It doesn't distinguish between tHead and tBodies...
		
			Rows is a collection of objects, NOT an array! So, can't use sort method!
			Rows[x] is a collection of objects too!
			Rows[x].innerHTML= is the html of the cells in that row of the table.
			E.g., "<td>field1</td><td>field2</>...<fieldN</>.
			We can put the innerHTML into an array of strings that can sort !
		*/
		
		//build array...
		var newRows = new Array(); // create empty array of strings
		for(i=0;i<Rows.length;i++) // Skip header row
		{
			//newRows = Rows with HTML row tags on either end of row
			 str = Rows[i].innerHTML;  // Oddly enough, this seems to work! I thought I'd have to push & pop
			
			// We need to strip out column[0] which contains the old row numbers. 
			var patt=/(?:<td>\d*<\/td>)([\s\S]+)/;
			
			newRows[i] = str.match(patt)[1]; // compact form of 2 lines below!
 			// var result=str.match(patt);
 			// newRows[i] = result[1];
		}
		
		// ...& get old sort info...
		var oldKeyField = getSortInfo( 'oldkeyfield' );
		var sortType = getSortInfo( 'oldsorttype' );
		
		// (1) check if previous field == current field: if not, then sort ascending
		if(oldKeyField != newKeyField){
			sortType = 'asc'; // default sort is ascending
		}
		else{ // (2) else reverse (toggle) sort direction
			 sortType = (sortType == 'desc' ? 'asc': 'desc');
		} // end if/else
		
		//...so we can SORT it by _newKeyField_ and _sortType_
		newRows.sort(byTag(newKeyField, sortType)); 
		
		// update recorded sort info
		var oldKeyField = setSortInfo( 'oldkeyfield', newKeyField );
		var sortType = setSortInfo( 'oldsorttype', sortType );
		
		//out with the old table contents
		emptyTable();
		
		// and in with the new: x.tBodies[0].innerHTML=newRows;
		outputAsTable(newRows); //old school
		
		// TO DO:  update appropriate column heading with 'A-Z' or 'Z-A' (i.e., some version of 'theTable.rows[0].cells[x].innerHTML')
	}
	
	function emptyTable(){
		x=document.getElementById("kb_table"); // x points to table
		x.tBodies[0].innerHTML="";
	}
	
	function collectionToArray(collection) // thank you sitepoint!
	{
		var ary = [];
		for(var i=0, len = collection.length; i < len; i++)
		{
			ary.push(collection[i]);
		}
		return ary;
	 }
		
	function newElement(element, etext, className){
		//This one creates a new passed element (e.g., 'h2');
		// adds a text child node with 'etext' if supplied
		// sets class to 'className' if supplied
		// and returns new node object
		
		var theElement = document.createElement(element);
		if(etext != null){
			var txt = document.createTextNode(etext);
			theElement.appendChild(txt);
		}
		if(className != null){
			theElement.className = "center";
		}
		return theElement;
	}

}


