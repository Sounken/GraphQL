function progess(totalDown, totalUp) {
    const audit = document.getElementById('audit');
    // calcule le ratio d'audit = totalUp/totalDown
    auditRatioRender(totalDown, totalUp);
}
function updateTotalXP(totalXP) {
    const totalXPDiv = document.getElementById('totalXP');
    totalXPDiv.innerHTML = `<p class="card-text">Total XP: ${totalXP}</p>`;
}

function getUserId(query, token, callback) {
    // Envoyez la requête GraphQL à l'endpoint
    axios.post('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
            query
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            // Gérez la réponse
            
            let infoData = response["data"]["data"]["user"][0];
            const id = infoData["id"];
            const login = infoData["login"];
            const totalDown = infoData["totalDown"];
            const totalUp = infoData["totalUp"];
            const auditRatio = infoData["auditRatio"];

            const roundedAudit = auditRatio.toFixed(1); // Arrondi à 1 chiffre après la virgule
            
            renderStatus(id, infoData["firstName"],infoData["lastName"], totalDown, totalUp, roundedAudit, );
            progess(totalDown, totalUp);
            callback(id);
        })
        .catch(error => {
            // Gérez l'erreur
            console.error(error);
        });
}

function sendRequest(query, token,callback) {
    // Envoyez la requête GraphQL à l'endpoint
    axios.post('https://zone01normandie.org/api/graphql-engine/v1/graphql', {
            query
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            // Gérez la réponse

            renderChart(response);
            callback(response.data.data.transaction);
        })
        .catch(error => {
            // Gérez l'erreur
            console.error(error);
        });
}

function homePage(eventId = 20) {
    const token = localStorage.getItem('jwt');
    if (!token) {
        // Redirection vers la page de connexion
        window.location.href = './index.html';
    }   
    // Construire la requête GraphQL
    const query = `{
        user{
            id
            login
            totalUp
            totalDown
            auditRatio
            email
            firstName
            lastName
        }
    }
    `;
    let query2;
 
    getUserId(query, token, id => {
        if (eventId === 20||eventId === 37)  {
            query2 = `
                 query {
                   transaction(where: { userId: { _eq: ${id} },type: { _eq:xp }, eventId: { _eq:${eventId}} }) {
                     amount
                     path
                     createdAt
                   }
                 }
               `;
               }else{
               query2 =`
               query {
                 transaction(where: { userId: { _eq: ${id} },type: { _eq:xp }, eventId: { _in:[10,2] } }) {
                   amount
                   path
                   createdAt
                 }
               }
             `;
               }
        const callbackTotal = (data) => {
            // calculez le total de XP à partir des données
            let totalXP = 0;
            data.forEach((t) => {
                totalXP += t.amount;
            });
            updateTotalXP(totalXP);    
        }
        let data = sendRequest(query2, token, callbackTotal);
    });

}

function renderStatus(id, firstName,lastName, totalDown, totalUp, auditRatio,totalXP) {
    const status = document.getElementById('status');
    status.innerHTML = `
    <div class="card">
    <div class="card-body">
        <h5 class="card-title">Welcome ${firstName} ${lastName}!</h5>
        <p class="card-text">Received: ${totalDown}</p>
        <p class="card-text">Done: ${totalUp}</p>
        <p class="card-text">Audit Ratio: ${auditRatio}</p>
        <p class="card-text" id="totalXP" >Total XP: ${totalXP}</p>
    </div>
    </div>
    `

}


function renderChart(response) {
    let allData = response.data.data.transaction.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const chart = new frappe.Chart("#chart", {
        title: "Graphique en lignes et en barres",
        data: {
            labels: allData.map((t) => {
                const date = new Date(t.createdAt);
                const year = date.getFullYear();
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const day = ("0" + date.getDate()).slice(-2);
                const project = t.path.split("/")[3];
                return `${year}-${month}-${day} (${project})`;
            }),
            datasets: [{
                    name: "Cumulatif",
                    values: allData.map((t, i, a) => {
                        const cumulativeAmount = a
                            .slice(0, i + 1)
                            .reduce((sum, t) => sum + t.amount, 0);
                        return cumulativeAmount;
                    }),
                    chartType: "line",
                },
                {
                    name: "Montant",
                    values: allData.map((t) => t.amount),
                    chartType: "bar",
                    
                },
            ],
        },
        type: "axis-mixed",
        height: 300,
        colors: ["#1e90ff", "#ff6384"],
        axisOptions: {
            xIsSeries: true,
            x: {
                label: "Date",
                type: "timeseries",
                tickFormat: "%b %d, %Y",
                tickInterval: "day"
            },
            y: {
                label: "Montant",
            },
        },
    });
}

function auditRatioRender(totalDown, totalUp) {
    let audit = totalUp / totalDown;
  
    const barChart = new frappe.Chart('#barChart', {
      data: {
        labels: [`Ratio d'audit${audit.toFixed(1)}`],
        datasets: [{
          name: 'Reçu',
          values: [totalDown]
        }, {
          name: 'Fait',
          values: [totalUp]
        }]
      },
      title: 'Ratio audit',
      type: 'bar',
      colors: ['#ff6384', '#36a2eb'],
      height: 500,
      width: 500
    });
  }
  
const chartSelect = document.getElementById('chart-select');
// 20 curriculum scolaire
// 37 piscine js
// 10 piscine go
let eventId ;
chartSelect.addEventListener('change', (event) => {
    const chartName = event.target.value;
    if (chartName === 'school-curriculum') {
        eventId = 20;
    } else if (chartName === 'piscine-js') {
        eventId = 37;

    } else if (chartName === 'piscine-go') {
        eventId = 45;
    
    }
    homePage(eventId);

});
const logoutBtn = document.querySelector('#logout-btn');

logoutBtn.addEventListener('click', () => {
  // Effectuez l'action de déconnexion ici
    localStorage.clear();
    window.location.href = 'index.html';
});
homePage(eventId);
