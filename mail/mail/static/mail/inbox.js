// cd /mail/ there are two mail folders

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email)



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view_Email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view_Email').style.display = 'none';
 
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 style="background-color:aqua;">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //Display inbox,sent, archive
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // take the json data, looping through each email at a time
      emails.forEach(singleEmail => {
        console.log(singleEmail)
        let from = singleEmail.sender
        let body = singleEmail.body
        let time = singleEmail.timestamp
        let archived = singleEmail.archived
        let read = singleEmail.read
        let id = singleEmail.id

        
        const wall = document.querySelector('#emails-view')

        // creating a div to put the email information, just focusing on inbox for now
        let paper_div = document.createElement('div');
        
        paper_div.innerHTML = `
          <strong>From:</strong> ${from}<br>
          <strong>Body:</strong> ${body}<br>
          <strong>Time:</strong> ${time}<br>
        `
        paper_div.style.borderBottom = '1px solid black'
        paper_div.style.padding = "4px"
        // added this line
        paper_div.style.background = "lightgrey"

        paper_div.addEventListener('click', function() {
          console.log('This element has been clicked!');
          view_email(id, mailbox)
        })
        
        if (read === true) {
          paper_div.style.background = "white";
        } else {}

      wall.append(paper_div)
        
      })
      

  });
}

function send_email() {
  event.preventDefault()
  recipients = document.getElementById('compose-recipients').value
  subject = document.getElementById('compose-subject').value
  body = document.getElementById('compose-body').value
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
  });
}


function view_email(id, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view_Email').style.display = 'block';

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
      })
    })


  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ... sender, recipients, subjects, timestamp, body
    const sender = email.sender
    const recipients = email.recipients
    const subjects = email.subject
    const time = email.timestamp
    const body = email.body
    let archive = email.archived
    const read = email.read
    const id = email.id




    const wall = document.querySelector('#view_Email')
    wall.innerHTML = `
      <h3>Single Email</h3>
      <strong>From:</strong> ${sender}<br>
      <strong>Recipient:</strong> ${recipients}<br>
      <strong>Subject:</strong> ${subjects}<br>
      <strong>Body:</strong> ${body}<br>
      <strong>Time:</strong> ${time}<br>
    `
    

    reply_button = document.createElement('button');
    reply_button.className='btn btn-primary';
    reply_button.textContent = "Reply"
    reply_button.style.marginLeft = '5px'

    reply_button.addEventListener('click', function() {
      compose_email();

      // To: = compose-recipients......... sender coorilates 
      to = document.getElementById('compose-recipients')
      subject = document.getElementById('compose-subject')
      newBody = document.getElementById('compose-body')

      to.value = sender
      
      if (subjects.includes("Re:")) {
        subject.value = `${subjects}`
      }
      else 
      {subject.value = `Re: ${subjects}`}
      newBody.value = `On ${time} ${sender} wrote: ${body}`


      

    })
  
    
    archive_button = document.createElement('button')
    archive_button.className='btn btn-primary';
    
 

    // Switch Archive/unarchive /////////////////////////////////////////////////
    if (archive === false) {
      archive_button.textContent = "Archive"
    } else {
      archive_button.textContent = "Unarchive"
    }

    archive_button.addEventListener('click', function() {

      // Completed toggle code /////////////////////////////////
      let toggle = true

      if (archive === false) {
        archive = toggle
      }
      else {
        archive_button.textContent = "Unarchive"
        toggle = false
      }
      fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: toggle
          })
        })
        // Bring back to inbox /////////////////////////////
        load_mailbox('inbox')
      })

        if (mailbox !== 'sent') {
      wall.append(archive_button)
    }
    wall.append(reply_button)    
  });
}