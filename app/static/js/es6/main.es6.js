/* jshint unused: false */

function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
  'use strict';
  $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
}

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('#registration').click(newUser);
  }

  function newUser(){
    ajax('/users/new', 'get', null, html=>{
      $('#login').empty().append(html);
    });
  }

})();
