
var ERROR = 'ERROR';

// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        console.log('Portrait.');
    }
    else {
        console.log('Landscape.');
    }
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    onDeviceReady();
}

// Display messages in the console.
function log(message) {
    console.log(`[${new Date()}] ${message}`);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`Errors when executing SQL query. [Code: ${error.code}] [Message: ${error.message}]`);
}

// Run this function after starting the application.
function onDeviceReady() {
    // Logging.
    log(`Device is ready.`);

    prepareDatabase(db); //Insert Table database
}

// Submit a form to register a new account.
$(document).on('submit', '#page-create #frm-register', confirmAccount);
$(document).on('submit', '#page-create #frm-confirm', registerAccount);

function confirmAccount(e) {
    e.preventDefault();

    // Get user's input.
    var username = $('#page-create #frm-register #username').val();
    var street = $('#page-create #frm-register #street').val();
    var city = $('#page-create #frm-register #city option:selected ').text();
    var district = $('#page-create #frm-register #district option:selected ').text();
    var ward = $('#page-create #frm-register #ward option:selected ').text();
    var type = $('#page-create #frm-register #type option:selected ').text();
    var furniture = $('#page-create #frm-register #furniture option:selected ').text();
    var bedroom = $('#page-create #frm-register #bedroom ').val();
    var price = $('#page-create #frm-register #price ').val();
    var reporter = $('#page-create #frm-register #reporter ').val();

    checkAccount(username, street, city, district, ward, type, furniture, bedroom, price, reporter);

}

function checkAccount(username, street, city, district, ward, type, furniture, bedroom, price, reporter) {

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Account WHERE Username = ?';
        tx.executeSql(query, [username], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                log('Open the confirmation popup.');

                $('#page-create #error').empty();

                $('#page-create #frm-confirm #username').val(username);
                $('#page-create #frm-confirm #street').val(street + "," + ward + "," + district + "," + city);
                $('#page-create #frm-confirm #type').val(type);
                $('#page-create #frm-confirm #furniture').val(furniture);
                $('#page-create #frm-confirm #bedroom').val(bedroom);
                $('#page-create #frm-confirm #price').val(price);
                $('#page-create #frm-confirm #reporter').val(reporter);

                $('#page-create #frm-confirm').popup('open');
            }
            else {
                var error = '* Customer Name exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}

function registerAccount(e) {
    e.preventDefault();

    // Get user's input.
    var username = $('#page-create #frm-register #username').val();
    var street = $('#page-create #frm-register #street').val();
    var city = $('#page-create #frm-register #city option:selected ').text();
    var district = $('#page-create #frm-register #district option:selected ').text();
    var ward = $('#page-create #frm-register #ward option:selected ').text();
    var type = $('#page-create #frm-register #type option:selected ').text();
    var furniture = $('#page-create #frm-register #furniture option:selected ').text();
    var bedroom = $('#page-create #frm-register #bedroom ').val();
    var price = $('#page-create #frm-register #price ').val();
    var reporter = $('#page-create #frm-register #reporter ').val();

    db.transaction(function (tx) {
        var query = `INSERT INTO Account (Username, Street, City, District, Ward, Type, Furniture, Bedroom, Price, Reporter, DateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, julianday('now'))`;
        tx.executeSql(query, [username, street, city, district, ward, type, furniture, bedroom, price, reporter], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a username '${username}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#username').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}

//Validation Form
//$(document).on('submit','#page-create #frm-register', function () {
//    isValid('#page-create #frm-register');
//});
function isValid(form) {
    var isValid = true;
    var error = $(`${form} #error`);

    error.empty();

    if ($(`${form} #city`).val() == -1) {
        isValid = false;
        error.append('<p>* City is required.</p>');
    }

    if ($(`${form} #district`).val() == -1) {
        isValid = false;
        error.append('<p>* District is required.</p>');
    }

    if ($(`${form} #ward`).val() == -1) {
        isValid = false;
        error.append('<p>* Ward is required.</p>');
    }

    if ($(`${form} #type`).val() == -1) {
        isValid = false;
        error.append('<p>* Type is required.</p>');
    }

    if ($(`${form} #furniture`).val() == -1) {
        isValid = false;
        error.append('<p>* Furniture is required.</p>');
    }


    return isValid;
}


// Display Account List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = `SELECT Id, Username, Street, City, District, Ward, Bedroom, Price FROM Account`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Show list of accounts successfully.`);

            // Prepare the list of accounts.
            var listAccount = `<ul id='list-account' data-role='listview' data-filter='true' data-filter-placeholder='Search customer...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;

            for (let account of result.rows) {
                listAccount += `<li><a data-details='{"Id" : ${account.Id}}'>
                                    <img src='img/personicon.png'>
                                    <h3>Customer: ${account.Username}</h3>
                                    <p>City:${account.Street}, ${account.Ward}, ${account.District}, ${account.City}</p>
                                    <p>Bedroom: ${account.Bedroom}</p>
                                    <p>Price: ${account.Price}</p>
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.
            $('#list-account').empty().append(listAccount).listview('refresh').trigger('create');
        }
    });
}

// Save Account Id.
$(document).on('vclick', '#list-account li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentAccountId', id);

    $.mobile.navigate('#page-detail', { transition: 'none' });
});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = `SELECT Account.*, datetime(Account.DateAdded, '+7 hours') AS DateAddedConverted FROM Account
                        LEFT JOIN City ON City.Id = Account.City
                        LEFT JOIN District ON District.Id = Account.District
                        LEFT JOIN Ward ON Ward.Id = Account.Ward
                        WHERE Account.Id = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Account not found.';
            var username = errorMessage;
            var street = errorMessage;
            var city = errorMessage;
            var district = errorMessage;
            var ward = errorMessage;
            var type = errorMessage;
            var furniture = errorMessage;
            var bedroom = errorMessage;
            var price = errorMessage;
            var reporter = errorMessage;
            var date = errorMessage;


            if (result.rows[0] != null) {
                username = result.rows[0].Username;
                street = result.rows[0].Street;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                type = result.rows[0].Type;
                furniture = result.rows[0].Furniture;
                bedroom = result.rows[0].Bedroom;
                price = result.rows[0].Price;
                reporter = result.rows[0].Reporter;
                date = result.rows[0].DateAddedConverted;
            }
            else {
                log(errorMessage);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #id').text(id);
            $('#page-detail #username').text(username);
            $('#page-detail #ward').text(street + "," + ward + "," + district + "," + city);
            $('#page-detail #type').text(type);
            $('#page-detail #furniture').text(furniture);
            $('#page-detail #bedroom').text(bedroom);
            $('#page-detail #price').text(price);
            $('#page-detail #reporter').text(reporter);
            $('#page-detail #date').text(date);

            showComment();
        }
    });
}

// Delete Account.
$(document).on('vclick', '#page-detail #btn-delete', deleteAccount);

function deleteAccount() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Account WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete account '${id}' successfully.`);

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

// Add comment.
$(document).on('vclick', '#page-detail #popup-comment #btn-comment', createComment);

function createComment() {
    var accountId = localStorage.getItem('currentAccountId');
    var comment = $(`#page-detail #popup-comment #txt-comment`).val();

    db.transaction(function (tx) {
        var query = `INSERT INTO Comment (AccountId, Comment, DateAdded) VALUES (?, ?, julianday('now'))`;
        tx.executeSql(query, [accountId, comment], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add comment to account '${accountId}' successfully.`);


            showComment();

            $('#page-detail #popup-comment #txt-comment').val('');
            $('#page-detail #popup-comment ').popup('close');
        }
    });
}


function showComment() {
    var accountId = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = `SELECT *, datetime(DateAdded, '+7 hours') AS DateAdded FROM Comment WHERE AccountId = ?`;
        tx.executeSql(query, [accountId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Show list of Comment successfully.`);

            // Prepare the list of accounts.
            var listComment = `<ul id='list-comment' data-role='listview'>`;
            for (let comment of result.rows) {
                listComment += `<li>
                                    <fieldset class='ui-grid-a' style='margin-top: 25px;'>
                                        <div class='ui-block-a'>
                                        <h1>${comment.DateAdded}</h1>
                                            <h3><b>Note</b>: ${comment.Comment}</h3>
                                        </div>
                                        <div class='ui-block-b'>
                                            <a href='#delete-comment-confirm' data-rel='popup' data-position-to='window' data-transition='none'
                                                class='ui-btn ui-btn-b ui-btn-icon-notext ui-corner-all ui-icon-delete' id="btn-delete-comment-confirm">Delete Note</a>
                                        </div>
                                    </fieldset>
                                </li>`;
            }
            listComment += `</ul>`;

            // Add list to UI.
            $('#list-comment').empty().append(listComment).listview('refresh').trigger('create');
        }
    });
}



//Delete Commnet
$(document).on('vclick', '#page-detail #btn-delete-comment', deleteComment);

function deleteComment() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = `DELETE FROM Comment WHERE AccountId = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete comment '${id}' successfully.`);

            $.mobile.navigate('#page-detail', { transition: 'reset' });
            $('#page-detail #btn-delete-comment').trigger('reset');
        }
        showComment();  
    });
}

//City,District,Ward
$(document).on('pagebeforeshow', '#page-create', function () {
    importCity('#page-create #frm-register');
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #city', function () {
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});
$(document).on('change', '#page-create #frm-register #district', function () {
    importWard('#page-create #frm-register');
});


function importCity(form, selectedName = ``) { //Function use to get data from the data City
    db.transaction(function (tx) {
        var query = `SELECT * FROM City ORDER BY Name`;
        //alert("City: " + query);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value=''>Select City</option>`;

            for (let item of result.rows) { //Conditions to get the value of City's data
                optionList += `
                <option value='${item.Id}' ${selectedName == item.Name ? 'selected' : ''}>${item.Name}</option>`;

            }
            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function importDistrict(form, selectedName = ``,selectedCity = ''){ //Function use to get data from the data District
    var id = $(`${form} #city`).val();

    db.transaction(function (tx) {
        var query = '';
        if(selectedCity) {
            query = `SELECT District.* FROM District LEFT JOIN City  ON CityId = City.Id WHERE City.Name = "${selectedCity}" ORDER BY District.Name`;
        }
        else {
            query = `SELECT * FROM District WHERE CityId = ${id} ORDER BY Name`;
        }

        //alert("District: " + query);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value=''>Select District</option>`;

            for (let item of result.rows) { //Conditions to get the value of District's data
                optionList += `
                <option value='${item.Id}' ${selectedName == item.Name ? 'selected' : ''}>${item.Name}</option>`;

            }
            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWard(form, selectedName = ``,selectedDistrict= ``) { //Function use to get data from the data Ward
    var id = $(`${form} #district`).val();

    db.transaction(function (tx) {
        var query = '';
        if(selectedDistrict) {
            query = `SELECT Ward.* FROM Ward LEFT JOIN District ON DistrictId = District.Id WHERE District.Name = "${selectedDistrict}" ORDER BY Ward.Name`;
        }
        else {
            query = `SELECT * FROM Ward WHERE DistrictId = ${id} ORDER BY Name`;
        }

        //alert("Ward: " + query);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value=''>Select Ward</option>`;

            for (let item of result.rows) { //Conditions to get the value of Ward's data
                optionList += `
                <option value='${item.Id}' ${selectedName == item.Name ? 'selected' : ''}>${item.Name}</option>`;

            }
            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}

//Type
$(document).on('pagebeforeshow', '#page-create', function () {
    importType('#page-create #frm-register');
});

function importType(form, selectedName = ``) { //Function use to get data from the data Type
    db.transaction(function (tx) {
        var query = `SELECT * FROM Type ORDER BY Name`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value=''>Select Type</option>`;

            for (let item of result.rows) { //Conditions to get the value of Type's data
                optionList += `
                <option value='${item.Id}' ${selectedName == item.Name ? 'selected' : ''}>${item.Name}</option>`;

            }
            $(`${form} #type`).html(optionList);
            $(`${form} #type`).selectmenu('refresh', true);
        }
    });
}

//Furniture
$(document).on('pagebeforeshow', '#page-create', function () {
    importFurniture('#page-create #frm-register');
});

function importFurniture(form, selectedName = ``) { //Function use to get data from the data Furniture
    db.transaction(function (tx) {
        var query = `SELECT * FROM Furniture ORDER BY Name`;
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList = `<option value=''>Select Furniture</option>`;

            for (let item of result.rows) { //Conditions to get the value of Furniture's data
                optionList += `
                <option value='${item.Id}' ${selectedName == item.Name ? 'selected' : ''}>${item.Name}</option>`;

            }
            $(`${form} #furniture`).html(optionList);
            $(`${form} #furniture`).selectmenu('refresh', true);
        }
    });
}

//Update Customer
$(document).on('vclick', '#page-detail #btn-update-popup', showUpdate); //The command used to display the Update
$(document).on('submit', '#page-detail #frm-update', updateAccount);

$(document).on('vclick', '#page-detail #frm-update #cancel', function () {
    $('#page-detail #frm-update').popup('close');
});

$(document).on('pagebeforeshow', '#page-detail', function () {
    importCity('#page-detail #frm-update');
    importDistrict('#page-detail #frm-update');
    importWard('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #city', function () {
    importDistrict('#page-detail #frm-update');
    importWard('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #district', function () {
    importWard('#page-detail #frm-update');
});


function showUpdate() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = `SELECT * FROM Account WHERE Id = ?`;

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] != null) {
                log(`Get details of account '${result.rows[0].Username}' successfully.`);

                $(`#page-detail #frm-update #username`).val(result.rows[0].Username);
                $(`#page-detail #frm-update #street`).val(result.rows[0].Street);
                $(`#page-detail #frm-update #price`).val(result.rows[0].Price);
                $(`#page-detail #frm-update #bedroom`).val(result.rows[0].Bedroom);
                $('#page-detail #frm-update #reporter').val(result.rows[0].Reporter);

                importCity('#page-detail #frm-update', result.rows[0].City);
                importDistrict('#page-detail #frm-update', result.rows[0].District, result.rows[0].City);
                importWard('#page-detail #frm-update', result.rows[0].Ward, result.rows[0].District);
                importType('#page-detail #frm-update', result.rows[0].Type);
                importFurniture('#page-detail #frm-update', result.rows[0].Furniture);

            }
        }
    });
}

function updateAccount(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentAccountId');
    var username = $(`#page-detail #frm-update #username`).val();
    var street = $(`#page-detail #frm-update #street`).val();
    var city = $(`#page-detail #frm-update #city option:selected`).text();
    var district = $(`#page-detail #frm-update #district option:selected`).text();
    var ward = $(`#page-detail #frm-update #ward option:selected`).text();
    var type = $(`#page-detail #frm-update #type option:selected`).text();
    var furniture = $(`#page-detail #frm-update #furniture option:selected`).text();
    var bedroom = $(`#page-detail #frm-update #bedroom`).val();
    var price = $(`#page-detail #frm-update #price`).val();
    var reporter = $(`#page-detail #frm-update #reporter`).val();

    db.transaction(function (tx) { //Command to Update Account data
        var query = `UPDATE Account
                        SET Username = ?, Street = ?,
                        City = ?, District = ?, Ward = ?,
                        Type = ?, Furniture = ?, Bedroom = ?, Price = ?, Reporter = ?,
                        DateAdded = julianday('now')
                        WHERE Id = ?`;

        tx.executeSql(query, [username, street, city, district, ward, type, furniture, bedroom, price, reporter, id], transactionSuccess, transactionError);
        function transactionSuccess(tx, result) {
            log(`Update Account '${username}' '${city}' successfully.`);

            showDetail();

            $('#page-detail #frm-update').popup('close');
            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

//Search
$(document).on('vclick', '#page-list #btn-reset', showList);
$(document).on('submit', '#page-list #frm-search', search);
$(document).on('vclick', '#page-list #btn-filter-popup', openFormSearch);

function openFormSearch(e) {
    e.preventDefault();
    $('#page-list #frm-search').popup('open');
}


$(document).on('pagebeforeshow', '#page-list', function () {
    importCity('#page-list #frm-search');
    importDistrict('#page-list #frm-search');
    importWard('#page-list #frm-search');
    importType('#page-list #frm-search');
    importFurniture('#page-list #frm-search');
});

$(document).on('change', '#page-list #frm-search #city', function () {
    importDistrict('#page-list #frm-search');
    importWard('#page-list #frm-search');
});

$(document).on('change', '#page-list #frm-search #district', function () {
    importWard('#page-list #frm-search');
});


function search(e) {
    e.preventDefault();

    var username = $(`#page-list #frm-search #username`).val();
    var street = $(`#page-list #frm-search #street`).val();
    var city = $(`#page-list #frm-search #city option:selected`).text();
    var district = $(`#page-list #frm-search #district option:selected`).text();
    var ward = $(`#page-list #frm-search #ward option:selected`).text();
    var type = $(`#page-list #frm-search #type option:selected`).text();
    var furniture = $(`#page-list #frm-search #furniture option:selected`).text();
    var bedroom = $(`#page-list #frm-search #bedroom`).val();
    var reporter = $(`#page-list #frm-search #reporter`).val();
    var priceMin = $(`#page-list #frm-search #price-min`).val();
    var priceMax = $(`#page-list #frm-search #price-max`).val();

    db.transaction(function (tx) {
        var query = `SELECT * FROM Account WHERE`;

        query += username ? ` Account.Username LIKE "%${username}%"   AND` : '';
        query += street ? ` Street LIKE "%${street}%"   AND` : '';
        query += city != 'Select City' ? ` City = "${city}"   AND` : '';
        query += district != 'Select District' ? ` District = "${district}"   AND` : '';
        query += ward != 'Select Ward' ? ` Ward = "${ward}"   AND` : '';
        query += type != 'Select Type' ? ` Type = "${type}"   AND` : '';
        query += bedroom ? ` Bedroom = ${bedroom}   AND` : '';
        query += furniture != 'Select Furniture' ? ` Furniture = "${furniture}"   AND` : '';
        query += reporter ? ` Reporter LIKE "%${reporter}%"   AND` : '';
        query += priceMin ? ` Price >= ${priceMin}   AND` : '';
        query += priceMax ? ` Price <= ${priceMax}   AND` : '';

        query = query.substring(0, query.length - 6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Search customer successfully.`);

            displayList(result.rows);

            $('#page-list #frm-search').trigger('reset');
            $('#page-list #frm-search').popup('close');
        }
    });
}

function displayList(list) {
    var accountList = `<ul id='list-property' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;

    accountList += list.length == 0 ? '<li><h2>No customer you want in here !</h2></li>' : '';

    for (let account of list) {
        accountList +=
            `<li><a data-details='{"Id" : ${account.Id}}'>
            <img src='img/personicon.png'>
            <h3>Customer: ${account.Username}</h3>
            <p>City:${account.Street}, ${account.Ward}, ${account.District}, ${account.City}</p>
            <p>Bedroom: ${account.Bedroom}</p>
            <p>Price: ${account.Price}</p>
        </a></li>`;
    }
    accountList += `</ul>`;

    $('#list-account').empty().append(accountList).listview('refresh').trigger('create');

    log(`Show list of properties successfully.`);
}
