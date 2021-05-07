package main

import (
	"os"
	"bufio"
	"fmt"
	"encoding/json"
	"net/http"
	"github.com/baidubce/bce-=cfc-go/pkg/cfc"
	"flag"
)

type Marriage struct {
	SpouseID int `json:"id"`
	marryDate int `json:"date"`
}

type People struct {
	Name string `json:"name"`
	ID int `json:"id"`
	FatherID int `json:"fatherID"`
	MatherID int `json:"matherID"`
	GenID int `json:"genID"`
	Children []int `json:"children"`
	Sex bool `json:"sex"`
	Marriages []Marriage `json:"spouses"`
	Jobs []string `json:"jobs"`
	Posts []string `json:"posts"`
	NativePlace string `json:"nativePlace"`
	PoliticalStatus string `json:"politicalStatus"`
	Habitation []string `json:"habitation"`
}

var allPeople map[int]People = make(map[int]People)

func init() {
	initAllPeople()
	cfc.RegisterNamedHandler("GenealogyHandler", &GenealogyHandler{})
}

func initAllPeople() {
	f, err := os.Open("people.json")
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)

	for scanner.Scan() {
		peopleJson := scanner.Text()
		res := &People{}
		res.Sex = true
		json.Unmarshal([]byte(peopleJson), &res)
		allPeople[res.ID] = *res
	}

	if err := scanner.Err(); err != nil {
		panic(err)
	}
}

func checkPeopleValide() bool {
	for id, people := range allPeople {
		// 检查父亲
		fatherID := people.FatherID
		if father, exist := allPeople[fatherID]; exist {
			inChildren := false
			for _, child := range father.Children {
				if child == id {
					inChildren = true
					break
				}
			}
			if !inChildren {
				fmt.Printf("%d%s的孩子里没有%d%s", father.ID, father.Name, id, people.Name)
				return false
			}
		}

		// 检查母亲
		// motherID := people.MatherID

		// 检查孩子
		for _, childID := range people.Children {
			if child, exist := allPeople[childID]; exist {
				if people.Sex { // father
					if id != child.FatherID {
						fmt.Printf("%d%s的父亲不是%d", id, people.Name, child.FatherID)
						return false
					}
				} else {
					// todo
				}
			}
		}

		// 检查夫妻
		for _, marriage := range people.Marriages {
			spouseID := marriage.SpouseID
			if spouse, exist := allPeople[spouseID]; exist {
				if spouse.Sex == people.Sex {
					fmt.Printf("%d%s的配偶%d%s性别异常", spouse.ID, spouse.Name, id, people.Name)
					return false
				}
				inSpouse := true
				for _, spouseMarriage := range spouse.Marriages {
					if spouseMarriage.SpouseID != id {
						inSpouse = false
						break
					}
				}
				if !inSpouse {
					fmt.Printf("%d%s的配偶不是%d%s", spouse.ID, spouse.Name, id, people.Name)
					return false
				}
			}
		}
	}
	return true
}

func main() {
	initAllPeople()
	if checkPeopleValide() {
		fmt.Println("check success")
	} else {
		fmt.Println("check failed")
	}

	http.HandleFunc("/family", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")             //允许访问所有域
		w.Header().Add("Access-Control-Allow-Headers", "Content-Type") //header的类型
		w.Header().Set("content-type", "application/json")             //返回数据格式是json
		w.WriteHeader(http.StatusOK)
		str, _ := json.Marshal(allPeople)
		w.Write(str)
	}))

	fmt.Println(allPeople)
    err := http.ListenAndServe(":12345", nil)
    if err != nil {
        fmt.Println("server failed")
    }
}