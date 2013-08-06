
var myBabyCount = 0;
var otherBabyCount = 0;
var momInfo = null;

var tmptmp = new Array();

// tabList is an array of objects including the following attributes:
// -tabId: it's the id of the tab
// -displayName: it's the name of the tab
// -type: 0-mom home; 1-my baby; 2-midwife home; 3-other baby   
// -babyId: index of the babyList array containing info on the baby (-1 if NA)
// -momId: Index of the momList array containing info on the mom (-1 if NA)

var tabList = new Array();
var momInnerTabList = new Array();
var babyInnerTabList = new Array();

var tabVisible = 0;
var babyList = new Array();    //Midwife
var mybabyList = new Array();    //Mom


try {
    google.load('visualization', '1', {'packages': ['corechart'], 'callback': gl});
}
catch(e) {
    alert('google load error: '+e.message);
    gl();
}


function gl() {
    init();
    addProfileTab();
    addListener();

    $('#close').click(function() {
        $('#dialog-container').fadeOut();
    });

}


function init() {
    momInnerTabList[0] = {
        'tabId': 'momIT0',
        'displayName': 'Blood pressure',
        'type': 0
    };
    momInnerTabList[1] = {
        'tabId': 'momIT1',
        'displayName': 'Blood sugar',
        'type': 1
    };
    momInnerTabList[2] = {
        'tabId': 'momIT2',
        'displayName': 'Heartrate',
        'type': 2
    };
    momInnerTabList[3] = {
        'tabId': 'momIT3',
        'displayName': 'Temperature',
        'type': 3
    };

    babyInnerTabList[0] = {
        'tabId': 'babyIT0',
        'displayName': 'Weight',
        'type': 10
    };
    babyInnerTabList[1] = {
        'tabId': 'babyIT1',
        'displayName': 'Temperature',
        'type': 11
    };
}


function getMyBabies(cbk) {
    queryMyBabyInfo(cbk);
}


function getOtherBabies(cbk) {
    queryBabyInfo(cbk); 
}


function addMyBaby() {
    var htmlCode = '';
    htmlCode += '<br><br>Add my new baby<br>';
    htmlCode += 'Name: <input type=\'text\' id=\'myBabyName\'><br>';
    htmlCode += 'Surname: <input type=\'text\' id=\'myBabySurname\'><br>';
    //TODO the input type date is supported by Chrome but not by Firefox
    htmlCode += 'Birthdate: <input type=\'date\' id=\'myBabyDate\'><br>';
    htmlCode += '<input type=\'button\' value=\'Save\' onclick=\'saveMyBaby()\'>';
    $('#dialog-content').html(htmlCode);
    $('#dialog-container').fadeIn(1000);
}


function saveMyBaby() {
    var babyName = $('#myBabyName').val();
    var babySurname = $('#myBabySurname').val();
    var babyDate = $('#myBabyDate').val();
    $('#addMyBaby').html('');
    var babyInfo = {};
    babyInfo.name = babyName;
    babyInfo.surname = babySurname;
    babyInfo.birthdate = new Date(babyDate);
    mybabyList.push(babyInfo);
    $('#dialog-container').fadeOut();
    addBabyTab(babyInfo.name, true, mybabyList.length-1);
    refreshTabLinks();
    displayTab(tabList[0].tabId, tabList, 'buttonTabSelected', 'buttonTab');
}


function addBabyTab(tabName, isMine, babyId) {
    //alert('addBabyTab - name: '+tabName+', babyId: '+babyId);
    var tabId;
    if(isMine) {
        tabId = 'myBaby'+myBabyCount+'Tab';
        myBabyCount ++;
        //console.log('myBabyCount:', myBabyCount);
    }
    else {
        tabId = 'otherBaby'+otherBabyCount+'Tab';
        otherBabyCount ++;
        //console.log('otherBabyCount:', otherBabyCount);
        
    }
    var tabLinkName = tabId+'Link';
    //Prepare tab content
    var tabInnerTabs = tabId+'InnerTabs';
    var tabInnerGraphs = tabId+'InnerGraphs';
    var tabRB = tabId+'RB';
    var htmlCode = '';
    var age;
    htmlCode += '<div id=\''+tabId+'\'>';
    htmlCode += '<table>';
    if(isMine) {
        htmlCode += '<tr><td>Name</td><td>'+mybabyList[babyId].name+'</td></tr>';
        htmlCode += '<tr><td>Surname</td><td>'+mybabyList[babyId].surname+'</td></tr>';
        htmlCode += '<tr><td>Birthdate</td><td>'+mybabyList[babyId].birthdate.toDateString()+'</td></tr>';
        age = getAge(mybabyList[babyId].birthdate);
    }
    else {
        htmlCode += '<tr><td>Name</td><td>'+babyList[babyId].name+'</td></tr>';
        htmlCode += '<tr><td>Surname</td><td>'+babyList[babyId].surname+'</td></tr>';
        htmlCode += '<tr><td>Birthdate</td><td>'+babyList[babyId].birthdate.toDateString()+'</td></tr>';
        age = getAge(babyList[babyId].birthdate);
    }
    htmlCode += '<tr><td>Age (total days)</td><td>'+age.totdays+'</td></tr>';
    htmlCode += '<tr><td>Age</td><td>'+age.years+' years, '+age.months+' months</td></tr>';
    if(!isMine) {
        htmlCode += '<tr><td>Mother name</td><td>'+babyList[babyId].motherName+'</td></tr>';
        htmlCode += '<tr><td>Mother surname</td><td>'+babyList[babyId].motherSurname+'</td></tr>';
        age = getAge(babyList[babyId].motherBirthdate);
        htmlCode += '<tr><td>Mother age</td><td>'+age.years+' years, '+age.months+' months</td></tr>';
    }
    htmlCode += '</table>';
    htmlCode += '<br><br>';
    htmlCode += '<div id=\''+tabInnerTabs+'\'></div>';
    htmlCode += '<div id=\''+tabInnerGraphs+'\'></div>';
    htmlCode += '<br><br>';
    htmlCode += '<input type=\'button\' value=\'Remove\' class=\'buttonGeneric\' id=\''+tabRB+'\'><br>';
    htmlCode += '</div>';
    $('#target').append(htmlCode);
    $('#'+tabId).hide();
    (function(ln, tn) {
        $('#'+ln).click(function() {removeTab(tn)});
    })(tabRB, tabId);

    //Baby page inner tab links
    var babyTabIds = new Array();
    for(var i=0; i<babyInnerTabList.length; i++) {
        var BITtabId = tabInnerTabs+babyInnerTabList[i].tabId;
        babyTabIds[i] = {};
        babyTabIds[i].tabId = BITtabId;
    }
    htmlCode = '';
    htmlCode += '<table><tr>';
    $('#'+tabInnerTabs).html(htmlCode);
    for(var i=0; i<babyInnerTabList.length; i++) {
        var BITlink = babyTabIds[i].tabId+'Link';
        htmlCode = '';
        htmlCode += '<td>';
        htmlCode += '<input type=\'button\' value=\''+babyInnerTabList[i].displayName+'\' id=\''+BITlink+'\' class=\'buttonInnerTab\'><br>';
        htmlCode += '</td>';
        $('#'+tabInnerTabs).append(htmlCode);
        (function(ln, tn, tabList) {
            $('#'+ln).click(function() {displayTab(tn, tabList, 'buttonInnerTabSelected', 'buttonInnerTab')});
        })(BITlink, babyTabIds[i].tabId, babyTabIds);
    }
    htmlCode = '</tr></table>';
    $('#'+tabInnerTabs).append(htmlCode);

    //Baby page inner tabs
    for(var i=0; i<babyInnerTabList.length; i++) {
        htmlCode = '';
        htmlCode += '<div id=\''+babyTabIds[i].tabId+'\'>';
        htmlCode += 'Showing baby '+babyInnerTabList[i].displayName;
        htmlCode += '<div id=\''+babyTabIds[i].tabId+'Graph\'>';
        htmlCode += '</div>';
        htmlCode += '</div>';
        $('#'+tabInnerGraphs).append(htmlCode);
        $('#'+babyTabIds[i].tabId).hide();
        var gh = new graphHandler();
        gh.displayGraph(babyTabIds[i].tabId+'Graph', babyInnerTabList[i].type, babyId);
    }

    //Add to tab list
    var tabElement = {};
    tabElement.tabId = tabId;
    tabElement.displayName = tabName;
    if(isMine) {
        tabElement.type = 1;
    }
    else {
        tabElement.type = 3;
    }
    
    //alert('addBabyTab - 05');
    if(isMine) {
        tabList.push(tabElement);
        refreshTabLinks();
    }
    else {
        // push before 'about mom' tab
        tabList.splice(1, 0, tabElement);
        refreshTabLinks();
    } 
}


function refreshTabLinks() {
    //alert('refreshTabLinks - 01');
    $('#leftcolumn').html('');
    var prevType = tabList[0].type;
    for(var i=0; i<tabList.length; i++) {
        var tabId = tabList[i].tabId;
        var link = tabId+'Link';
        var htmlCode = '';
        if(prevType != tabList[i].type) {
            if(prevType == 0) {
                htmlCode += '<br>My babies<br>';
            }
            else if(prevType == 2) {
                htmlCode += '<br>Babies<br>';
            }
            else {
                htmlCode += '<br><br>';
            }
            prevType = tabList[i].type;
        }
        htmlCode += '<input type=\'button\' value=\''+tabList[i].displayName+'\' id=\''+link+'\' class=\'buttonTab\'><br>';
        $('#leftcolumn').append(htmlCode);
        (function(ln, tn) {
            //$('#'+ln).click(function() {displayTab(tn)});
            $('#'+ln).click(function() {displayTab(tn, tabList, 'buttonTabSelected', 'buttonTab')});
        })(link, tabId);
    }
}


function removeTab(tabId) {
    $('#'+tabId).remove();
    for(var i=0; i<tabList.length; i++) {
        if(tabList[i].tabId == tabId) {
            tabList.splice(i, 1);
        }
    }
    refreshTabLinks();
    //displayTab(tabList[0].tabId);
    displayTab(tabList[0].tabId, tabList, 'buttonTabSelected', 'buttonTab');
}


function addProfileTab() {
    var htmlCode = '';
    htmlCode += '<table id=\'configuration_table\' border=0>';
    htmlCode += '<tr>'
    htmlCode += '<td>Profile</td>';
    htmlCode += '</tr>';
    htmlCode += '<tr>';
    htmlCode += '<td>';
    htmlCode += '<select id=\'profile\'>';
    htmlCode += '<option value=\'Profile\'>';
    htmlCode += 'Choose Your Profile';
    htmlCode += '</option>';
    htmlCode += '<option value=\'Mom\'>';
    htmlCode += 'Mom';
    htmlCode += '</option>';
    htmlCode += '<option value=\'Midwife\'>';
    htmlCode += 'Midwife';
    htmlCode += '</option>';
    htmlCode += '</select>';
    htmlCode += '</td>';
    htmlCode += '</tr>';
    
    //add enrol button - to enroll with health Hub
    $('#rightcolumn').append(htmlCode);
}


function addListener() {

    var profile = document.getElementById('profile');
    if (profile.addEventListener) {
        // DOM2 standard
        profile.addEventListener('change', changeHandler, false);
    }
    else if (profile.attachEvent) {
        // IE fallback
        profile.attachEvent('onchange', changeHandler);
    }
    else {
        // DOM0 fallback
        profile.onchange = changeHandler;
    } 
}


function changeHandler(event){
    launchPage();
}


function initMomInfo() {
    if(momInfo == null) {
        //momInfo = queryMomInfo();
        queryMomInfo(function(res) {
            momInfo = res;
            checkMomInfo();
        });
    }
    else {
        checkMomInfo();
    }
}


function checkMomInfo() {
    if(momInfo == null) {
        //If momInfo not stored, then ask for it...
        askMomInfo();
    }
    else {
        addMomTabs();
    }
    //refreshTabLinks();
    //displayTab(tabList[0].tabId);
}


function askMomInfo() {
    var htmlCode = '';
    htmlCode += 'Please, insert your informations<br><br>';
    htmlCode += 'Mother name: <input type=\'text\' id=\'momMotherName\'><br>';
    htmlCode += 'Mother surname: <input type=\'text\' id=\'momMotherSurname\'><br>';
    htmlCode += 'Mother birthdate: <input type=\'date\' id=\'momMotherDate\'><br>';
    htmlCode += '<input type=\'button\' value=\'Save\' onclick=\'saveMomInfo()\'>';
    $('#dialog-content').html(htmlCode);
    $('#dialog-container').fadeIn(1000);
}


function saveMomInfo() {
    //alert('saveMomInfo');
    momInfo = {};
    momInfo.name = $('#momMotherName').val();
    momInfo.surname = $('#momMotherSurname').val();
    momInfo.birthdate = new Date($('#momMotherDate').val());
    //TODO check that input values are valid
    storeMomInfo(momInfo);
    $('#dialog-container').fadeOut();
    addMomTabs();
}


function addMomTabs() {
    //Retrieves tab list for mom: mom home tab and her babies
    tabList = new Array();

    $('#target').html('');

    var age = getAge(momInfo.birthdate);
    var htmlCode = '';
    htmlCode += '<div id=\'momTab\'>';
    htmlCode += '<table>';
    htmlCode += '<tr><td>My name</td><td>'+momInfo.name+'</td></tr>';
    htmlCode += '<tr><td>My surname</td><td>'+momInfo.surname+'</td></tr>';
    htmlCode += '<tr><td>My birthdate</td><td>'+momInfo.birthdate.toDateString()+'</td></tr>';
    htmlCode += '<tr><td>My age</td><td>'+age.years+' years, '+age.months+' months</td></tr>';
    htmlCode += '</table>';
    htmlCode += '<br><br>';
    htmlCode += '<div id=\'momInnerTabs\'>';
    htmlCode += '</div>';
    htmlCode += '<div id=\'momInnerGraphs\'>';
    htmlCode += '</div>';
    htmlCode += '<br><br>';
    htmlCode += '<input type=\'button\' value=\'Add my baby\' class=\'buttonGeneric\' onclick=\'addMyBaby()\'>';
    htmlCode += '<div id=\'addMyBaby\'>';
    htmlCode += '</div>';
    htmlCode += '<br><br>';
    htmlCode += '<input type=\'button\' value=\'Change my info\' class=\'buttonGeneric\' onclick=\'askMomInfo()\'>';
    htmlCode += '</div>';
    $('#target').append(htmlCode);

    //Mom page inner tab links
    htmlCode = '';
    htmlCode += '<table><tr>';
    $('#momInnerTabs').html(htmlCode);
    for(var i=0; i<momInnerTabList.length; i++) {
        var tabId = momInnerTabList[i].tabId;
        var link = tabId+'Link';
        htmlCode = '';
        htmlCode += '<td>';
        htmlCode += '<input type=\'button\' value=\''+momInnerTabList[i].displayName+'\' id=\''+link+'\' class=\'buttonInnerTab\'><br>';
        htmlCode += '</td>';
        $('#momInnerTabs').append(htmlCode);
        (function(ln, tn, tabList) {
            $('#'+ln).click(function() {displayTab(tn, tabList, 'buttonInnerTabSelected', 'buttonInnerTab')});
        })(link, tabId, momInnerTabList);
    }
    htmlCode = '</tr></table>';
    $('#momInnerTabs').append(htmlCode);

    //Mom page inner tabs
    for(var i=0; i<momInnerTabList.length; i++) {
        var tabId = momInnerTabList[i].tabId;
        htmlCode = '';
        htmlCode += '<div id=\''+momInnerTabList[i].tabId+'\'>';
        htmlCode += 'Showing mom '+momInnerTabList[i].displayName;
        htmlCode += '<div id=\''+momInnerTabList[i].tabId+'Graph\'>';
        htmlCode += '</div>';
        htmlCode += '</div>';
        $('#momInnerGraphs').append(htmlCode);
        $('#'+momInnerTabList[i].tabId).hide();
        var gh = new graphHandler();
        gh.displayGraph(momInnerTabList[i].tabId+'Graph', momInnerTabList[i].type, -1);
    }

    var tabElement = {};
    tabElement.tabId = 'momTab';
    tabElement.displayName = 'About me';
    tabElement.type = 0;
    tabElement.babyId = -1;
    tabList.push(tabElement);

    for(var i=0; i<mybabyList.length; i++) {
        addBabyTab(mybabyList[i].name, true, i);
    }

    refreshTabLinks();
    displayTab(tabList[0].tabId, tabList, 'buttonTabSelected', 'buttonTab');
}


function addMidwifeTabs() {
    //Retrieves tab list for midwife: midwife home tab and her babies
    tabList = new Array();

    $('#target').html('');

    var htmlCode = '';
    htmlCode += '<div id=\'midwifeTab\'>';
    htmlCode += '<input type=\'button\' value=\'Connect new baby\' class=\'buttonGeneric\' onclick=\'connectNewBaby()\'>';
    htmlCode += '</div>';
    $('#target').append(htmlCode);

    var tabElement = {};
    tabElement.tabId = 'midwifeTab';
    tabElement.displayName = 'Midwife home';
    tabElement.type = 2;
    tabElement.babyId = -1;
    tabList.push(tabElement);

    for(var i=0; i<babyList.length; i++) {
        addBabyTab(babyList[i].name+' '+babyList[i].surname, false, i);
    }
}


function launchPage(){
    var profileVal = $('#profile').val();
    //alert('profile is:'+ profileVal);
    $('#target').html('');
    $('#leftcolumn').html('');
    if(profileVal === 'Mom') {
        //Retrieve my baby list
        getMyBabies(function(res) {
            mybabyList = res;
            myBabyCount = 0;
            //Constructs tabList for mom profile
            initMomInfo();
        });
    }
    else if (profileVal === 'Midwife') {
        //Retrieve midwife's baby list
        getOtherBabies(function(res) {
            babyList = res;
            otherBabyCount = 0;
/*
            if(babyList.length > 0) {
                alert('babyList.length: '+babyList.length); 
                for (var i = 0; i <  babyList.length; i++) {
                    //console.log('baby name:', babyList[i].name);
                    addBabyTab(babyList[i].name, false, i);
                }
            }
*/
            //Constructs tabList for midwife profile
            addMidwifeTabs();

            refreshTabLinks();
            displayTab(tabList[0].tabId, tabList, 'buttonTabSelected', 'buttonTab');
        });
    }
    else if (profileVal === 'Profile') {
        //$('#target').html('');
        //$('#leftcolumn').html('');
    }
}


function connectNewBaby() {
    //TODO This should connect to a remote db
    var htmlCode = '';
    htmlCode += '<br><br>Connect to a new baby<br>';
    htmlCode += 'Baby name: <input type=\'text\' id=\'midwifeBabyName\'><br>';
    htmlCode += 'Mother name: <input type=\'text\' id=\'midwifeMotherName\'><br>';
    htmlCode += '<input type=\'button\' value=\'Connect\' onclick=\'newBabyConnection()\'>';
    $('#dialog-content').html(htmlCode);
    $('#dialog-container').fadeIn(1000);
}


function newBabyConnection() {
    var babyName = $('#midwifeBabyName').val();
    var motherName = $('#midwifeMotherName').val();
    $('#dialog-container').fadeOut();
    connectToBaby(babyName, motherName);
}


// General functions for tab handling

/*
 * This function displays the tab selected identified by tabId and changes the class
 * of corresponding links. The id of links id tabId+'Link'.
 * tabId: selected tab
 * allTabs: array with all tabs
 * tabSelectedClass: class of of the link corresponding to a tab selected
 * tabUnselectedClass: class of of the link corresponding to a tab not selected
 *
 */
function displayTab(tabId, allTabs, tabSelectedClass, tabUnselectedClass) {
    //alert(tabId);
    for (i=0; i<allTabs.length; i++) {
        $('#'+allTabs[i].tabId).hide();
        $('#'+allTabs[i].tabId+'Link').removeClass(tabSelectedClass).addClass(tabUnselectedClass);
    }
    $('#'+tabId).show();
    $('#'+tabId+'Link').removeClass(tabUnselectedClass).addClass(tabSelectedClass);
}


function getAge(birthdate) {
    var today = new Date();
    var result = {};
    var age_ms = today - birthdate;
    result.totdays = Math.floor(age_ms/(1000*3600*24));
    var age_days = today.getDate() - birthdate.getDate();
    var age_months = today.getMonth() - birthdate.getMonth();
    var age_years = today.getFullYear() - birthdate.getFullYear();
    if(age_days<0) {
        age_months --;
    }
    if(age_months<0) {
        age_months += 12;
        age_years--;
    }
    result.months = age_months;
    result.years = age_years;
    return result;
}


