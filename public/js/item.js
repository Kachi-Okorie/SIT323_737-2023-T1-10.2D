const itemSocket = io("/Notifications");
let itemDetails;

/*****************************************************************************
Purpose: jQuery Function that runs once the DOM is loaded. Initialises a number 
of materialize css components and jquery events.
*****************************************************************************/
$(document).ready(function () {
    getItem();
    $(".modal").modal();
    $("select").formSelect();
});

/*****************************************************************************
Purpose: This function sends the ID in the URL to the /api/item/view route
and recives the corrisponding item details and passes them to loadItem
*****************************************************************************/
function getItem() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const itemID = urlParams.get("itemID");
    const url = "/api/item/view/" + itemID;
    $.get(url, (response) => {
        if (response.statusCode === 200) {
            console.log(response);
            console.log(response.data);
            loadItem(response.data);
        } else if (response.statusCode === 400) {
            html = `<h4 class="text-bold">Item not found</h4>`;
            document.getElementById("loadedItem").innerHTML = html;
        } else {
            console.log(response.message);
        }
    });
}

/*****************************************************************************
Purpose: This function takes the item output from get items and constructs 
dynamic HTML to placed on the item.html page
*****************************************************************************/
const loadItem = (item) => {
    //html to dynamically load item
    let html = `<div class="row">
    <div class="carousel carousel-slider align-center" data-indicators="true">`;
    item.itemImages.forEach((element) => {
        html += `<img class="carousel-item img-responsive" src="/api/item/itemimage/${element.newFilename}">`;
    });
    html += "</div>";

    html += `
    <div class="row">
    <div class="col s12 m6 offset-m3">

        <div class="card">
            <div class="card-image">`;

    

    html += `<a href="chat.html?userID=${item.userID}" class="btn-floating btn-large halfway-fab waves-effect waves-light"><i class="material-icons">message</i></a>
            </div>

            <span class="card-title col s12">${item.itemName}</span>
            <div class="card-content">
                <div class = "row">

                    <div class = "col s12"><b>Posted by: </b> <a href="/profile.html?userID=${item.userID}">${item.postingUserName}</a></div>       
                   
                    <div class = "col s12"><b>Description: </b> <br> ${item.itemDescription}</div>
                </>
                `;

    

    html += `
                </div>
            </div>
        </div>
    </div>
    `;

    document.getElementById("loadedItem").innerHTML = html;

    //show user controls if current user owns item
    if (item.sameUser) {
        $(".user-buttons").css("visibility", "visible");
    }
  
    //Initialise image carousel and config
    $(".carousel").carousel({
        fullWidth: false,
        indicators: true,
        duration: 200,
    });

    //function set to auto play materlizedcss carousel
    var carousel_interval = 3000;
    var int;
    function run() {
        int = setInterval(function () {
            $(".carousel").carousel("next");
        }, carousel_interval);
    }
    function stop() {
        clearInterval(int);
    }
    $(".carousel").hover(stop, run);

    //saves items details for other modules to use
    itemDetails = item;

    itemSocket.emit("whoami", (userName) => {
        console.log(`UserName:${userName}`);
        itemSocket.emit("lookingAt", item.userID, item.itemName, userName);
    });
};

/*****************************************************************************
Purpose: This function passes the item ID from the URL to the /api/item/delete
route. On success a modal is displayed with a messaged and countdown before
you are redirected to the profile page. countDown is called to perform the 
countdown and redirect.
*****************************************************************************/
const deleteItem = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const itemID = urlParams.get("itemID");
    $.ajax({
        url: "/api/item/delete/" + itemID,
        type: "POST",
        success: (result) => {
            console.log(result.message);
            let html = `<h4 class="text-bold h4 centre-align">${result.message}</h4>
            <h5 class = "h5 centre-align">Redirecting to profile in <span id="countdown">5</span></h5>
            `;
            document.getElementById("redirectPopupContent").innerHTML = html;
            $("#redirectPopup").modal("open");
            countDown();
        },
        error: (err) => {
            console.log(err);
        },
    });
};

/*****************************************************************************

Purpose: This function is called by the delete item fucntion counts down 7
seconds then redirects to the profile page.
*****************************************************************************/
let countDownSeconds = 7;
function countDown() {
    countDownSeconds -= 1;
    if (countDownSeconds < 0) {
        window.location = "/profile.html";
    } else {
        document.getElementById("countdown").innerHTML = countDownSeconds;
        window.setTimeout("countDown()", 1000); //1000 millisecond = 1 sec
    }
}

/*****************************************************************************
Function: updateAvailability
Purpose: This function takes the IT id from the URL and new item status from
itemAvailability dropdown and passes them to them to the
/api/item/updateavailability route on success page is reloaded.
*****************************************************************************/
const updateAvailability = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const itemID = urlParams.get("itemID");
    const status = $(`#itemAvailability`).val();
    const url = "/api/item/updateavailability/" + itemID + "/" + status;
    $.post(url, (response) => {
        if (response.statusCode === 200) {
            console.log(response);
            location.reload();
        } else {
            console.log(response);
        }
    });
};

/*****************************************************************************

Purpose: 
*****************************************************************************/
// itemSocket.on("connect", () => {
//     itemSocket.emit("whoami", (userName) => {
//         console.log(`UserName:${userName}`);
//         itemSocket.emit(
//             "lookingAt",
//             itemDetails.userID,
//             itemDetails.itemName,
//             userName
//         );
//     });
// });
