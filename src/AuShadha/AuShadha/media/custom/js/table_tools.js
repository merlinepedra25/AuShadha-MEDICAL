function tableTools(obj) {
  
  var table = obj;
  var totalForms = obj.totalForms;

  var used_prefix=[ ];
  var available_prefix=[];
  for(var i=0; i < parseInt(totalForms); i++){
    used_prefix.push(i);
  }

  var addIconSnippet    = obj.icons.remove;      
  var removeIconSnippet = obj.icons.add;      
  
  var emptyFormSnippet  = obj.emptyFormSnippet; // escapejs filtered emptyForm HTML snippet

  var snippetsList = [];
  for (var i=0; i<obj.snippets.length; i++){
    var _str = '<tr><td>'+obj.snippet[i]+'<td>';
    _str += "<td class='actionCell'>"+removeIconSnippet + addIcon+"</td></tr>";
    snippetsList.push(_str); // Create TABLE CELLS with passed snippets filtered with escapejs
  }

  require(["dojo/dom",
                "dojo/request",
                "dijit/registry"  ,
                "dojo/json"       ,
                "dojo/dom-form"   ,
                "dijit/Dialog"    ,
                'dojo/dom-class',
                'dojo/dom-style',
                'dojo/dom',
                'dojo/query',
                'dojo/dom-attr',
                'dojo/dom-construct',
                'dojo/_base/lang',
                "dojo/on",
                'dojo/parser',
                'dojo/NodeList-traverse',
                'dojo/NodeList-data'
        ],
        function(dom, 
                request, 
                registry, 
                JSON, 
                domForm, 
                Dialog, 
                domClass,
                domStyle,
                dom,
                query,
                domAttr,
                domConstruct,
                lang,
                on,
                parser){

//    var emptyVisitComplaintForm  = emptyVisitComplaintForm.replace(/__prefix__/g, totalVisitComplaintForms);

    function getAllRows(node /*String | domNode */){
//           console.log(node);
      var n = query("#"+node)[0];
//           console.log(n);
      if (n.tagName == 'TABLE'){
        var allRows = query(n).children('tbody').children('tr');
      }else if(n.tagName != "TABLE"){
        var allRows = query(n).parents('table').children('tbody').children('tr');
      }else{
        console.log("Query fetched nothing");
        return;
      }
      console.log("Returning All Rows of Table from getAllRows Function");
      console.log(allRows);
      return allRows;
    }

    function getNumRows(table_id/*String | domNode */){
      var allRows = getAllRows(table_id);
      return allRows.length;
    }

    function getLastRow(table_id/*String | domNode */){
//           console.log(table_id);
      var allRows = getAllRows(table_id);
//           console.log(allRows.length)
      if (allRows.length>0){
        console.log("Returning Last row...");
        console.log( query(allRows[allRows.length-1]) );
        return query(allRows[allRows.length-1]);
      }else{
        console.log("No Rows !. Cannot get the last row");                            
        return null;
      }
    }

    function getFirstRow(table_id/*String | domNode */){
      var allRows = getAllRows(table_id);
      if (allRows.length>0){
        return query(allRows[0]);
      }else{
        console.log("No Rows !. Cannot get the first row");
        return null;
      }
    }

    function getRowIndex(row/*query obj */){
      if(getAllRows >0){
        var allRows = getAllRows();
        try{
          return allRows.indexOf(row[0]);
        }catch(err){
          console.log(err.message);
          return
        }
      }else{
        console.log("No Rows to the number for !");
      }
    }

    function getRowFromTable(table_id /* String | domNode */,r /*String*/){
      var _r = parseInt(r);
      console.log("Received request for Table Row No. " + r + " in Table id: " + table_id);
      var _row_to_return = query("#"+table_id).children('tbody').children('tr')[_r-1];
      console.log("Returning Row with number: " + _r);
      console.log(_row_to_return);
      return _row_to_return;
    }

    function _getLastElem(l){
        if (l.length>0){
          l.sort();
          var _l = l.length;
          var i = _l-1;
          var e = l[i];
          return parseInt(e);
        }else{
          return null;
        }
    }


    function returnUnusedPrefix(){
      available_prefix.sort();            
      used_prefix.sort();                

      if(available_prefix.length >= 1 ){

        var _last_elem = _getLastElem(available_prefix);

        if (used_prefix.indexOf(_last_elem) == -1 ){
            console.log("used_prefix does not have the element");
            console.log("LAST ELEMENT OF USED_PREFIX" + used_prefix.indexOf(_last_elem).toString());
            available_prefix.pop();
            available_prefix.sort();
            used_prefix.push(_last_elem);
            used_prefix.sort();
            console.log("USED_PREFIX is" + used_prefix.toString());
            console.log("AVAILABLE_PREFIX is" + available_prefix.toString());
            return _last_elem;
        }else{
          console.log("used_prefix has the element");
          console.log("LAST ELEMENT OF USED_PREFIX" + used_prefix.indexOf(_last_elem).toString());
          console.log("USED_PREFIX is" + used_prefix.toString());
          console.log("AVAILABLE_PREFIX is" + available_prefix.toString());
          // FIXME May be an edge case.. but still...
        }
        

      }else{
        var _last_elem = _getLastElem(used_prefix);
        var _new_elem = parseInt(_last_elem) +1;
        used_prefix.push(_new_elem);
        used_prefix.sort();
        console.log("USED_PREFIX is" + used_prefix.toString());
        console.log("AVAILABLE_PREFIX is" + available_prefix.toString());
        return _new_elem;
      }

    }


    function rehashPrefixes(node){
      var n_id= domAttr.get(node.domNode,'id');
      var _id = parseInt(n_id.match(/\d+/g)[0]);
      var _available_ = available_prefix.indexOf(_id);
      var _used_ = used_prefix.indexOf(_id);          

      if(_available_ == -1){          
        if(_used_ != -1){
          used_prefix.splice(_used_,1);
          available_prefix.push(_id);
          console.log("USED_PREFIX is" + used_prefix.toString());
          console.log("AVAILABLE_PREFIX is" + available_prefix.toString());
        }else{
          console.log("PREFIX_ERROR!! PREFIXES CANNOT BE PRESENT IN BOTH LISTS");
          console.log("USED_PREFIX is" + used_prefix.toString());
          console.log("AVAILABLE_PREFIX is" + available_prefix.toString());
        }
      }else{
        available_prefix.splice(_available_,1);
        used_prefix.push(_id);
        console.log("USED_PREFIX is" + used_prefix.toString());
        console.log("AVAILABLE_PREFIX is" + available_prefix.toString());
      }
      available_prefix.sort();
      used_prefix.sort();

    }


    function lastButOneRowActionCellStyling(){
        var _t_id="visitComplaintEditFormTable_{{visit_detail_obj.id}}";
//             var lastRow = getLastRow(table_id);
        var _rn= parseInt(getNumRows(_t_id));
        console.log("Querying for Row with Number " + (_rn-1) + " in Table with ID: " + _t_id);
        if (_rn>=1){
          var _lbr = getRowFromTable(_t_id, _rn-1);
//               console.log(_lbr);
          var _aIcon = query(_lbr).children('td.actionCell').children('span.showNextComplaint')[0];
          var _rIcon = query(_lbr).children('td.actionCell').children('span.removeThisComplaint')[0];
          domStyle.set(_aIcon, {'display':'none'});
          domStyle.set(_rIcon,{'display':'table-cell'});
        }else{
          return;
        }
    }

    function lastRowActionCellStyling(){
        var table_id="visitComplaintEditFormTable_{{visit_detail_obj.id}}";
        var lastRow = getLastRow(table_id);
        var addIcon = lastRow.children('td.actionCell').children('span.showNextComplaint')[0];
        var removeIcon = lastRow.children('td.actionCell').children('span.removeThisComplaint')[0];
        domStyle.set(addIcon, {'display':'table-cell'});
        domStyle.set(removeIcon,{'display':'table-cell'});
    }

    function setTotalFormInputNumber(){
      var table_id='visitComplaintEditFormTable_{{visit_detail_obj.id}}';
      var numberOfRows = getNumRows(table_id);
      totalVisitComplaintForms = numberOfRows;
      domAttr.set("{{complaint_total_form_auto_id}}",{'value':totalVisitComplaintForms});
    }

    function incrementTotalFormInput(){
        totalVisitComplaintForms ++;
        domAttr.set("{{complaint_total_form_auto_id}}",{'value':totalVisitComplaintForms});
    }

    function decrementTotalFormInput(){
        totalVisitComplaintForms --;
        domAttr.set("{{complaint_total_form_auto_id}}",{'value':totalVisitComplaintForms});
    }


    function placeAndDijitiseRows(){
      var prefix = returnUnusedPrefix();
      var escapedComplaintHTML = complaintHTML.replace( /__prefix__/g,  prefix);
      var escapedDurationHTML = durationHTML.replace( /__prefix__/g, prefix );
      var HTMLToInsert = rowStart + escapedComplaintHTML + escapedDurationHTML + actionButtonCells + rowEnd;
      var rowInserted = domConstruct.place(HTMLToInsert,query("#visitComplaintEditFormTable_{{visit_detail_obj.id}} tbody")[0] );
      parser.parse(rowInserted);
      var addIcon = query(rowInserted).children('td.actionCell').children('span.showNextComplaint')[0];
      var removeIcon = query(rowInserted).children('td.actionCell').children('span.removeThisComplaint')[0];
      on(addIcon,'click',onAddMoreComplaintsClick);
      on(removeIcon,'click',function(){onRemoveComplaintClick(removeIcon);});
      setTotalFormInputNumber();
    }

    function onAddMoreComplaintsClick(){
          placeAndDijitiseRows();
          lastButOneRowActionCellStyling();
          lastRowActionCellStyling();
    }

    function rollBackRows(r){
      var table_id = "visitComplaintEditFormTable_{{visit_detail_obj.id}}";

      if(getNumRows(table_id) >1){
        registry.
            findWidgets(r).
              forEach(function(n,i){
                        if (i==0){rehashPrefixes(n); }
                        n.destroyRecursive(false);
                      });

        domConstruct.destroy(r);
      }

      if(getNumRows(table_id) >1){
        lastButOneRowActionCellStyling();
      }
      lastRowActionCellStyling();
      setTotalFormInputNumber();
    }

    function onRemoveComplaintClick(evt){

      if (confirm("This will delete the complaint.. Proceed ?")){
        var closestRow    = query(evt).closest('tr');
        var rowToDelete   = closestRow[0];
        var delBtn        = closestRow.
                              children('td.actionCell').
                              children('span.removeThisComplaint')[0];
        var parentTable = closestRow.parents('table');
        var urlToCall   = domAttr.get(delBtn,'data-url');

        if(urlToCall !== 'null'){
          console.log("Requesting delete of the complaint");
          request(urlToCall).then(
          function(json){
            var jsondata = JSON.parse(json);
            if(jsondata.success == true){
              publishInfo("Successfully Deleted Complaint");
              rollBackRows(rowToDelete);
            }else{
              publishError("ERROR! "+ jsondata.error_message);
            }
          },
          function(){
            publishError("ERROR! Server Error");
          }
          );
        }else{
          console.log("Deleting the Complaint forms");
          rollBackRows(rowToDelete);
          console.log("Destroyed Empty forms");
        }

      }
      console.log("CONFIRM_DIALOG_CLOSED");
    }

  function bindAddMoreComplaintsClick(){
    query('.showNextComplaint').forEach(
    function(node){
      on(node,'click',onAddMoreComplaintsClick);
    });
  }

  function bindRemoveComplaintsClick(){
    query('.removeThisComplaint').forEach(
    function(node){
        on(node,'click',function(evt){onRemoveComplaintClick(evt.target);});
    });
  }

  bindAddMoreComplaintsClick();
  bindRemoveComplaintsClick();

});
  return table;
}