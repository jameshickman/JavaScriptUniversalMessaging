describe('Navigation Module Tests', function() {
  beforeEach(function(browser) {
    // Start with a fresh page for each test
    browser.url('http://localhost:3000/_test_navigation/index.html');
  });

  it('should show the first view by default', function(browser) {
    // First view should be visible initially
    browser.expect.element('#main-views div[data-name="view1"]').to.be.visible;
    browser.expect.element('#main-views div[data-name="view2"]').to.not.be.visible;
    browser.expect.element('#main-views div[data-name="view3"]').to.not.be.visible;
  });

  it('should navigate to second view when clicked', function(browser) {
    // Click the second view button
    browser.click('#main-navigation button[data-view="view2"]');
    
    // Second view should be visible, others hidden
    browser.expect.element('#main-views div[data-name="view1"]').to.not.be.visible;
    browser.expect.element('#main-views div[data-name="view2"]').to.be.visible;
    browser.expect.element('#main-views div[data-name="view3"]').to.not.be.visible;
  });

  it('should navigate to third view when clicked', function(browser) {
    // Click the third view button
    browser.click('#main-navigation button[data-view="view3"]');
    
    // Third view should be visible, others hidden
    browser.expect.element('#main-views div[data-name="view1"]').to.not.be.visible;
    browser.expect.element('#main-views div[data-name="view2"]').to.not.be.visible;
    browser.expect.element('#main-views div[data-name="view3"]').to.be.visible;
  });

  it('should persist navigation state in URL hash', function(browser) {
    // Click to the second view
    browser.click('#main-navigation button[data-view="view2"]');
    
    // URL should contain the view in the hash
    browser.expect.url().to.contain('view2');
    
    // Refresh the page
    browser.refresh();
    
    // Second view should still be visible after refresh
    browser.expect.element('#main-views div[data-name="view2"]').to.be.visible;
  });

  after(function(browser) {
    browser.end();
  });
});