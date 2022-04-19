/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList).toContain("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(datesSorted).toStrictEqual([
        "2004-04-04",
        "2003-03-03",
        "2002-02-02",
        "2001-01-01",
      ]);
    });

    // new test for new bill form button
    test("Then if I click on new bill button, the new bill form should be displayed", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("btn-new-bill"));
      const newBillButton = screen.getByTestId("btn-new-bill");
      fireEvent.click(newBillButton);
      await waitFor(() => screen.getByTestId("form-new-bill"));
      const newBillForm = screen.getByTestId("form-new-bill");
      expect(newBillForm).toBeTruthy();
    });

    // new test for modal view of bill
    test("Then if I click the eye icon of a bill, the bill modal should be displayed", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getAllByTestId("icon-eye"));
      const billEyeIcons = screen.getAllByTestId("icon-eye");

      $.fn.modal = jest.fn();

      fireEvent.click(billEyeIcons[0]);
      await waitFor(() => screen.getByText("Justificatif"));
      const modalTitle = screen.getByText("Justificatif");
      expect(modalTitle).toBeTruthy();
    });
  });
});

// // new test get bills
// describe("Testing get Bills", () => {
//   Object.defineProperty(window, localStorage, { value: localStorageMock });
//   window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

//   const html = BillsUI({ data: bills });
//   document.body.innerHTML = html;

//   const onNavigate = (pathname) => {
//     document.body.innerHTML = ROUTES({ pathname });
//   };

//   const testBill = new Bills({
//     document,
//     onNavigate,
//     store: null,
//     localStorage: localStorageMock,
//   });

//   // jest.spyOn(testBill, "getBills");

//   test("Should return mocked bills", () => {
//     expect(testBill.getBills).toBe(1);
//   });
// });

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const newBillButtonText = await screen.getByText(
        "Nouvelle note de frais"
      );
      expect(newBillButtonText).toBeTruthy();
      const viewModalColumnTitle = await screen.getByText("Actions");
      expect(viewModalColumnTitle).toBeTruthy();
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
          })
        );
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
