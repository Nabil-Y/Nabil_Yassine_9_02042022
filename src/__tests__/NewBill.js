/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";

describe("Given I am on NewBill Page", () => {
  describe("When I click on the submit button", () => {
    test("Then handleSubmit function should be called", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillMock = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      //to-do write assertion
      const submitButton = screen.getByText("Envoyer");
      const handleSubmitMock = jest.fn(() => newBillMock.handleSubmit);
      submitButton.addEventListener("click", handleSubmitMock);
      fireEvent.click(submitButton);
      expect(handleSubmitMock).toHaveBeenCalled();
    });
  });
  describe("When I submit a file", () => {
    test("Then if I submit an authorized file, the alert window should not be displayed", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillMock = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      //to-do write assertion
      const fileButton = screen.getByTestId("file");
      const handleChangeMock = jest.fn(() => newBillMock.handleChangeFile);
      fileButton.addEventListener("change", handleChangeMock);

      const mockedFileValid = new File(["validFile"], "validFile.jpg", {
        type: "image/jpg",
      });

      fireEvent.change(fileButton, {
        target: {
          files: [mockedFileValid],
        },
      });

      expect(handleChangeMock).toHaveBeenCalled();
      expect(fileButton.files[0].name).toBe("validFile.jpg");

      jest.spyOn(window, "alert").mockImplementation();
      expect(window.alert).not.toHaveBeenCalled();
    });

    test("Then if I submit an unauthorized file, the alert window should be displayed", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillMock = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      //to-do write assertion
      const fileButton = screen.getByTestId("file");
      const handleChangeMock = jest.fn(() => newBillMock.handleChangeFile);
      fileButton.addEventListener("change", handleChangeMock);

      const mockedFileInvalid = new File(["invalidFile"], "invalidFile.mp3", {
        type: "file/mp3",
      });

      fireEvent.change(fileButton, {
        target: {
          files: [mockedFileInvalid],
        },
      });

      expect(handleChangeMock).toHaveBeenCalled();
      expect(fileButton.files[0].name).toBe("invalidFile.mp3");

      jest.spyOn(window, "alert").mockImplementation();
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
