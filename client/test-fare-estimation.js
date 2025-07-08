// Test script to verify fare estimation refresh
// This script can be run in the browser console to test the fare estimation

console.log("Testing fare estimation refresh...");

// Function to simulate route change
function simulateRouteChange() {
  const testRoute = [
    { name: "Test Stop 1", lat: 12.9716, lon: 77.5946 },
    { name: "Test Stop 2", lat: 12.9816, lon: 77.6046 },
    { name: "Test Stop 3", lat: 12.9916, lon: 77.6146 },
  ];

  // This would normally be done through the React components
  console.log("Simulating route change with:", testRoute);

  // Test fare estimation API call
  fetch("http://localhost:5000/api/bus/estimate-fare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      start: testRoute[0].name,
      end: testRoute[testRoute.length - 1].name,
      route: testRoute,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Fare estimation result:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Run the test
simulateRouteChange();
